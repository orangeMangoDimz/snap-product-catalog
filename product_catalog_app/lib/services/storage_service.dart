import 'package:hive_flutter/hive_flutter.dart';
import '../models/product.dart';

class StorageService {
  static const String _productsBoxName = 'products';
  static const String _metadataBoxName = 'metadata';

  static const String _lastFetchKey = 'last_fetch';
  static const String _totalProductsKey = 'total_products';
  static const String _categoriesKey = 'categories';

  late Box<Product> _productsBox;
  late Box _metadataBox;

  Future<void> init() async {
    await Hive.initFlutter();

    if (!Hive.isAdapterRegistered(0)) {
      Hive.registerAdapter(ProductAdapter());
    }

    _productsBox = await Hive.openBox<Product>(_productsBoxName);
    _metadataBox = await Hive.openBox(_metadataBoxName);
  }

  Future<void> saveProducts(List<Product> products) async {
    final Map<int, Product> productMap = {
      for (Product product in products) product.id: product,
    };

    await _productsBox.putAll(productMap);

    await _metadataBox.put(
      _lastFetchKey,
      DateTime.now().millisecondsSinceEpoch,
    );

    final Set<String> categories = products.map((p) => p.category).toSet();
    final existingCategories = getCategories();
    categories.addAll(existingCategories);
    await _metadataBox.put(_categoriesKey, categories.toList());
  }

  Future<void> saveProduct(Product product) async {
    await _productsBox.put(product.id, product);

    // Update categories if new
    final categories = getCategories();
    if (!categories.contains(product.category)) {
      categories.add(product.category);
      await _metadataBox.put(_categoriesKey, categories);
    }
  }

  // Get all products from local storage
  List<Product> getAllProducts() {
    return _productsBox.values.toList();
  }

  // Get product by ID
  Product? getProduct(int id) {
    return _productsBox.get(id);
  }

  // Get products with pagination
  List<Product> getProducts({int? limit, int? skip, String? category}) {
    List<Product> products = getAllProducts();

    // Filter by category
    if (category != null && category.isNotEmpty) {
      products = products.where((p) => p.category == category).toList();
    }

    products.sort((a, b) => a.id.compareTo(b.id));

    // Apply pagination
    if (skip != null && skip > 0) {
      products = products.skip(skip).toList();
    }

    if (limit != null && limit > 0) {
      products = products.take(limit).toList();
    }

    return products;
  }

  // Search products locally
  List<Product> searchProducts(String query) {
    if (query.isEmpty) return getAllProducts();

    final String lowerQuery = query.toLowerCase();

    return getAllProducts().where((product) {
      return product.title.toLowerCase().contains(lowerQuery) ||
          product.description.toLowerCase().contains(lowerQuery) ||
          product.category.toLowerCase().contains(lowerQuery);
    }).toList();
  }

  List<String> getCategories() {
    final categories = _metadataBox.get(
      _categoriesKey,
      defaultValue: <String>[],
    );
    return List<String>.from(categories);
  }

  List<String> getCategoriesFromProducts() {
    final Set<String> categories = getAllProducts()
        .map((p) => p.category)
        .toSet();
    return categories.toList()..sort();
  }

  bool hasProducts() {
    return _productsBox.isNotEmpty;
  }

  int getProductCount() {
    return _productsBox.length;
  }

  DateTime? getLastFetchTime() {
    final timestamp = _metadataBox.get(_lastFetchKey);
    return timestamp != null
        ? DateTime.fromMillisecondsSinceEpoch(timestamp)
        : null;
  }

  bool isDataStale({Duration maxAge = const Duration(hours: 1)}) {
    final lastFetch = getLastFetchTime();
    if (lastFetch == null) return true;

    return DateTime.now().difference(lastFetch) > maxAge;
  }

  Future<void> clearProducts() async {
    await _productsBox.clear();
    await _metadataBox.delete(_lastFetchKey);
    await _metadataBox.delete(_totalProductsKey);
  }

  Future<void> clearAllData() async {
    await _productsBox.clear();
    await _metadataBox.clear();
  }

  Future<void> setTotalProducts(int total) async {
    await _metadataBox.put(_totalProductsKey, total);
  }

  int? getTotalProducts() {
    return _metadataBox.get(_totalProductsKey);
  }

  Future<void> close() async {
    await _productsBox.close();
    await _metadataBox.close();
  }

  Map<String, dynamic> getStorageStats() {
    return {
      'productCount': getProductCount(),
      'categories': getCategoriesFromProducts().length,
      'lastFetch': getLastFetchTime()?.toIso8601String(),
      'totalProducts': getTotalProducts(),
      'isStale': isDataStale(),
    };
  }
}
