import pool from '../db/pool.js';

export const getSuppliers = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT 
        s.supplier_id,
        s.name,
        s.contact,
        s.ingredient_type,
        COUNT(DISTINCT sp.product_id) AS product_count,
        COUNT(DISTINCT e.expense_id) AS expense_count
      FROM supplier s
      LEFT JOIN supplierprice sp ON s.supplier_id = sp.supplier_id
      LEFT JOIN expense e ON s.supplier_id = e.supplier_id
      GROUP BY s.supplier_id, s.name, s.contact, s.ingredient_type
      ORDER BY s.name`
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

export const getSupplierPriceComparison = async (req, res, next) => {
  try {
    const result = await pool.query(
      `WITH price_stats AS (
        SELECT
          p.product_id,
          p.name AS product_name,
          MIN(sp.price) AS best_price,
          MAX(sp.price) AS worst_price
        FROM product p
        JOIN supplierprice sp ON sp.product_id = p.product_id
        GROUP BY p.product_id, p.name
      ),
      best_suppliers_data AS (
        SELECT
          ps.product_id,
          JSON_AGG(DISTINCT jsonb_build_object('supplier_id', s.supplier_id, 'name', s.name, 'price', sp.price)) AS suppliers
        FROM price_stats ps
        JOIN supplierprice sp ON sp.product_id = ps.product_id AND sp.price = ps.best_price
        JOIN supplier s ON s.supplier_id = sp.supplier_id
        GROUP BY ps.product_id
      ),
      worst_suppliers_data AS (
        SELECT
          ps.product_id,
          JSON_AGG(DISTINCT jsonb_build_object('supplier_id', s.supplier_id, 'name', s.name, 'price', sp.price)) AS suppliers
        FROM price_stats ps
        JOIN supplierprice sp ON sp.product_id = ps.product_id AND sp.price = ps.worst_price
        JOIN supplier s ON s.supplier_id = sp.supplier_id
        GROUP BY ps.product_id
      )
      SELECT
        ps.product_id,
        ps.product_name,
        ps.best_price,
        ps.worst_price,
        COALESCE(bs.suppliers, '[]'::json) AS best_suppliers,
        COALESCE(ws.suppliers, '[]'::json) AS worst_suppliers
      FROM price_stats ps
      LEFT JOIN best_suppliers_data bs ON ps.product_id = bs.product_id
      LEFT JOIN worst_suppliers_data ws ON ps.product_id = ws.product_id
      ORDER BY ps.product_id`
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

export const getSupplierPricesForProduct = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.productId, 10);
    if (Number.isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product id' });
    }

    // Get the latest price from each supplier for this product
    const result = await pool.query(
      `WITH latest_prices AS (
        SELECT DISTINCT ON (sp.supplier_id)
          sp.supplier_id,
          sp.price,
          sp.effective_date
        FROM supplierprice sp
        WHERE sp.product_id = $1
        ORDER BY sp.supplier_id, sp.effective_date DESC
      )
      SELECT
        lp.supplier_id,
        s.name AS supplier_name,
        lp.price,
        lp.effective_date
      FROM latest_prices lp
      JOIN supplier s ON s.supplier_id = lp.supplier_id
      ORDER BY lp.price ASC`,
      [productId]
    );

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

export const getSupplierPriceHistory = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.productId, 10);
    if (Number.isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product id' });
    }

    const result = await pool.query(
      `SELECT
        sp.supplier_id,
        s.name AS supplier_name,
        sp.price,
        sp.effective_date
      FROM supplierprice sp
      JOIN supplier s ON s.supplier_id = sp.supplier_id
      WHERE sp.product_id = $1
      ORDER BY sp.effective_date DESC`,
      [productId]
    );

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

export const getSupplierOptimization = async (req, res, next) => {
  try {
    // Get all products with their current supplier prices
    const productsWithPrices = await pool.query(
      `WITH latest_prices AS (
        SELECT DISTINCT ON (sp.product_id, sp.supplier_id)
          sp.product_id,
          sp.supplier_id,
          sp.price,
          sp.effective_date
        FROM supplierprice sp
        ORDER BY sp.product_id, sp.supplier_id, sp.effective_date DESC
      )
      SELECT
        p.product_id,
        p.name AS product_name,
        p.cost AS current_cost,
        lp.supplier_id,
        s.name AS supplier_name,
        s.ingredient_type,
        lp.price AS supplier_price,
        lp.effective_date,
        COUNT(DISTINCT e.expense_id) AS expense_count,
        COUNT(DISTINCT sp2.product_id) AS supplier_product_count
      FROM product p
      JOIN latest_prices lp ON p.product_id = lp.product_id
      JOIN supplier s ON s.supplier_id = lp.supplier_id
      LEFT JOIN expense e ON e.supplier_id = s.supplier_id
      LEFT JOIN supplierprice sp2 ON sp2.supplier_id = s.supplier_id
      GROUP BY p.product_id, p.name, p.cost, lp.supplier_id, s.name, s.ingredient_type, lp.price, lp.effective_date
      ORDER BY p.product_id, lp.price ASC`
    );

    // Get current supplier assignments (use cheapest as baseline since we don't track actual assignments)
    const currentAssignments = await pool.query(
      `WITH latest_prices AS (
        SELECT DISTINCT ON (sp.product_id, sp.supplier_id)
          sp.product_id,
          sp.supplier_id,
          sp.price,
          sp.effective_date
        FROM supplierprice sp
        ORDER BY sp.product_id, sp.supplier_id, sp.effective_date DESC
      ),
      cheapest_suppliers AS (
        SELECT DISTINCT ON (lp.product_id)
          lp.product_id,
          lp.supplier_id,
          lp.price AS current_price
        FROM latest_prices lp
        ORDER BY lp.product_id, lp.price ASC
      )
      SELECT
        product_id,
        supplier_id,
        current_price
      FROM cheapest_suppliers`
    );

    // Build data structures for optimization
    const products = {};
    const suppliers = {};
    const currentCosts = {};

    // Process current assignments
    currentAssignments.rows.forEach((row) => {
      currentCosts[row.product_id] = parseFloat(row.current_price) || 0;
    });

    // Process products and suppliers
    productsWithPrices.rows.forEach((row) => {
      const productId = row.product_id;
      const supplierId = row.supplier_id;

      if (!products[productId]) {
        products[productId] = {
          product_id: productId,
          product_name: row.product_name,
          current_cost: parseFloat(row.current_cost) || 0,
          suppliers: [],
        };
      }

      // Calculate supplier reliability score (based on expense count and product count)
      const expenseCount = parseInt(row.expense_count) || 0;
      const productCount = parseInt(row.supplier_product_count) || 0;
      const reliabilityScore = Math.min(1.0, (expenseCount * 0.3 + productCount * 0.1) / 10);

      products[productId].suppliers.push({
        supplier_id: supplierId,
        supplier_name: row.supplier_name,
        price: parseFloat(row.supplier_price) || 0,
        reliability_score: reliabilityScore,
        ingredient_type: row.ingredient_type,
      });

      if (!suppliers[supplierId]) {
        suppliers[supplierId] = {
          supplier_id: supplierId,
          supplier_name: row.supplier_name,
          product_count: 0,
        };
      }
    });

    // Optimization Algorithm: Multi-factor scoring
    // Score = (price_weight * normalized_price) + (reliability_weight * reliability_score)
    // Lower score is better
    const recommendations = [];
    let totalCurrentCost = 0;
    let totalOptimizedCost = 0;
    const supplierUsage = {};

    Object.values(products).forEach((product) => {
      if (product.suppliers.length === 0) return;

      // Calculate scores for each supplier
      const prices = product.suppliers.map((s) => s.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const priceRange = maxPrice - minPrice || 1;

      const scoredSuppliers = product.suppliers.map((supplier) => {
        // Normalize price (0 = cheapest, 1 = most expensive)
        const normalizedPrice = priceRange > 0 
          ? (supplier.price - minPrice) / priceRange 
          : 0;

        // Weighted score: 70% price, 30% reliability (inverted - lower is better)
        const priceWeight = 0.7;
        const reliabilityWeight = 0.3;
        const score = (priceWeight * normalizedPrice) + (reliabilityWeight * (1 - supplier.reliability_score));

        return {
          ...supplier,
          score,
          normalizedPrice,
        };
      });

      // Sort by score (best first)
      scoredSuppliers.sort((a, b) => a.score - b.score);

      // Select best supplier
      const recommended = scoredSuppliers[0];
      const currentPrice = currentCosts[product.product_id] || recommended.price;

      totalCurrentCost += currentPrice;
      totalOptimizedCost += recommended.price;

      supplierUsage[recommended.supplier_id] = 
        (supplierUsage[recommended.supplier_id] || 0) + 1;

      recommendations.push({
        product_id: product.product_id,
        product_name: product.product_name,
        current_supplier_price: currentPrice,
        recommended_supplier_id: recommended.supplier_id,
        recommended_supplier_name: recommended.supplier_name,
        recommended_price: recommended.price,
        savings: currentPrice - recommended.price,
        savings_percent: currentPrice > 0 
          ? ((currentPrice - recommended.price) / currentPrice * 100).toFixed(2)
          : 0,
        alternative_suppliers: scoredSuppliers.slice(1, 4).map((s) => ({
          supplier_name: s.supplier_name,
          price: s.price,
          score: s.score.toFixed(3),
        })),
      });
    });

    // Calculate supplier diversity score
    const uniqueSuppliers = Object.keys(supplierUsage).length;
    const totalProducts = recommendations.length;
    const diversityScore = totalProducts > 0 
      ? (uniqueSuppliers / totalProducts * 100).toFixed(1)
      : 0;

    // Sort recommendations by savings (highest first)
    recommendations.sort((a, b) => b.savings - a.savings);

    res.json({
      recommendations,
      summary: {
        total_current_cost: totalCurrentCost.toFixed(2),
        total_optimized_cost: totalOptimizedCost.toFixed(2),
        total_savings: (totalCurrentCost - totalOptimizedCost).toFixed(2),
        savings_percent: totalCurrentCost > 0
          ? (((totalCurrentCost - totalOptimizedCost) / totalCurrentCost) * 100).toFixed(2)
          : 0,
        products_analyzed: recommendations.length,
        unique_suppliers_recommended: uniqueSuppliers,
        diversity_score: diversityScore,
        supplier_usage: Object.entries(supplierUsage).map(([id, count]) => {
          const supplier = Object.values(suppliers).find((s) => s.supplier_id === parseInt(id));
          return {
            supplier_id: parseInt(id),
            supplier_name: supplier?.supplier_name || 'Unknown',
            product_count: count,
          };
        }).sort((a, b) => b.product_count - a.product_count),
      },
    });
  } catch (error) {
    next(error);
  }
};

