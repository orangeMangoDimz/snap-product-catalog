import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/product.dart';
import '../models/api_response.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';

final apiServiceProvider = Provider<ApiService>((ref) => ApiService());
final storageServiceProvider = Provider<StorageService>(
  (ref) => StorageService(),
);

final searchQueryProvider = StateProvider<String>((ref) => '');
final selectedCategoryProvider = StateProvider<String?>((ref) => null);
final isOnlineProvider = StateProvider<bool>((ref) => true);

final isLoadingProvider = StateProvider<bool>((ref) => false);
final isLoadingMoreProvider = StateProvider<bool>((ref) => false);
final errorMessageProvider = StateProvider<String?>((ref) => null);

final currentPageProvider = StateProvider<int>((ref) => 0);
final hasMoreProductsProvider = StateProvider<bool>((ref) => true);

class ProductsState {
  final List<Product> products;
  final bool isLoading;
  final bool isLoadingMore;
  final String? error;
  final bool hasMore;
  final int currentPage;
  final int totalProducts;

  const ProductsState({
    this.products = const [],
    this.isLoading = false,
    this.isLoadingMore = false,
    this.error,
    this.hasMore = true,
    this.currentPage = 0,
    this.totalProducts = 0,
  });

  ProductsState copyWith({
    List<Product>? products,
    bool? isLoading,
    bool? isLoadingMore,
    String? error,
    bool? hasMore,
    int? currentPage,
    int? totalProducts,
  }) {
    return ProductsState(
      products: products ?? this.products,
      isLoading: isLoading ?? this.isLoading,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      error: error,
      hasMore: hasMore ?? this.hasMore,
      currentPage: currentPage ?? this.currentPage,
      totalProducts: totalProducts ?? this.totalProducts,
    );
  }
}

class ProductsNotifier extends StateNotifier<ProductsState> {
  ProductsNotifier(this._apiService, this._storageService)
    : super(const ProductsState());

  final ApiService _apiService;
  final StorageService _storageService;

  static const int pageSize = 20;
  Timer? _searchDebounceTimer;

  Future<void> initialize() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final localProducts = _storageService.getAllProducts();
      if (localProducts.isNotEmpty) {
        state = state.copyWith(
          products: localProducts,
          totalProducts: localProducts.length,
          isLoading: false,
        );
      }

      if (_storageService.isDataStale() || localProducts.isEmpty) {
        await refreshProducts();
      } else {
        state = state.copyWith(isLoading: false);
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> refreshProducts() async {
    state = state.copyWith(isLoading: true, error: null, currentPage: 1);

    try {
      final response = await _apiService.getProducts(limit: pageSize, page: 1);

      await _storageService.saveProducts(response.products);
      await _storageService.setTotalProducts(response.total);

      state = state.copyWith(
        products: response.products,
        totalProducts: response.total,
        hasMore: response.products.length >= pageSize,
        currentPage: 1,
        isLoading: false,
      );
    } catch (e) {
      // If API fails, use local data if available
      final localProducts = _storageService.getAllProducts();
      state = state.copyWith(
        products: localProducts,
        totalProducts: localProducts.length,
        isLoading: false,
        error: localProducts.isEmpty ? e.toString() : null,
      );
    }
  }

  Future<void> loadMoreProducts() async {
    if (state.isLoadingMore || !state.hasMore) return;

    state = state.copyWith(isLoadingMore: true);

    try {
      final nextPage = state.currentPage + 1;
      final response = await _apiService.getProducts(
        limit: pageSize,
        page: nextPage,
      );

      if (response.products.isNotEmpty) {
        await _storageService.saveProducts(response.products);

        final updatedProducts = [...state.products, ...response.products];

        state = state.copyWith(
          products: updatedProducts,
          currentPage: nextPage,
          hasMore: response.products.length >= pageSize,
          isLoadingMore: false,
        );
      } else {
        state = state.copyWith(hasMore: false, isLoadingMore: false);
      }
    } catch (e) {
      state = state.copyWith(isLoadingMore: false, error: e.toString());
    }
  }

  void searchProducts(String query) {
    _searchDebounceTimer?.cancel();

    if (query.isEmpty) {
      final allProducts = _storageService.getAllProducts();
      state = state.copyWith(
        products: allProducts,
        currentPage: 0,
        hasMore: false,
      );
      return;
    }

    _searchDebounceTimer = Timer(const Duration(milliseconds: 300), () {
      _performSearch(query);
    });
  }

  Future<void> _performSearch(String query) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final localResults = _storageService.searchProducts(query);

      state = state.copyWith(
        products: localResults,
        isLoading: false,
        hasMore: false,
        currentPage: 0,
      );

      if (await _apiService.isConnected()) {
        final response = await _apiService.searchProducts(
          query: query,
          page: 1,
        );

        state = state.copyWith(
          products: response.products,
          totalProducts: response.total,
          hasMore: response.products.length >= pageSize,
        );
      }
    } catch (e) {
      final currentProducts = state.products;
      state = state.copyWith(
        isLoading: false,
        error: currentProducts.isEmpty ? e.toString() : null,
      );
    }
  }

  void filterByCategory(String? category) {
    if (category == null) {
      final allProducts = _storageService.getAllProducts();
      state = state.copyWith(
        products: allProducts,
        currentPage: 0,
        hasMore: false,
      );
    } else {
      final filteredProducts = _storageService.getProducts(category: category);
      state = state.copyWith(
        products: filteredProducts,
        currentPage: 0,
        hasMore: false,
      );
    }
  }

  void clearError() {
    state = state.copyWith(error: null);
  }
}

final productsNotifierProvider =
    StateNotifierProvider<ProductsNotifier, ProductsState>((ref) {
      return ProductsNotifier(
        ref.read(apiServiceProvider),
        ref.read(storageServiceProvider),
      );
    });

final categoriesProvider = Provider<List<String>>((ref) {
  final storageService = ref.read(storageServiceProvider);
  return storageService.getCategoriesFromProducts();
});

final filteredProductsProvider = Provider<List<Product>>((ref) {
  final productsState = ref.watch(productsNotifierProvider);
  final searchQuery = ref.watch(searchQueryProvider);
  final selectedCategory = ref.watch(selectedCategoryProvider);

  List<Product> products = productsState.products;

  if (searchQuery.isNotEmpty) {
    final lowerQuery = searchQuery.toLowerCase();
    products = products.where((product) {
      return product.title.toLowerCase().contains(lowerQuery) ||
          product.description.toLowerCase().contains(lowerQuery) ||
          product.category.toLowerCase().contains(lowerQuery);
    }).toList();
  }

  if (selectedCategory != null) {
    products = products
        .where((product) => product.category == selectedCategory)
        .toList();
  }

  return products;
});

final productProvider = FutureProvider.family<Product?, int>((
  ref,
  productId,
) async {
  final storageService = ref.read(storageServiceProvider);
  final apiService = ref.read(apiServiceProvider);

  final localProduct = storageService.getProduct(productId);
  if (localProduct != null) {
    return localProduct;
  }

  try {
    final product = await apiService.getProduct(productId);
    await storageService.saveProduct(product);
    return product;
  } catch (e) {
    return null;
  }
});

final aiSummaryProvider = FutureProvider.family<AiSummaryData?, int>((
  ref,
  productId,
) async {
  final apiService = ref.read(apiServiceProvider);

  try {
    return await apiService.getAiSummary(productId);
  } catch (e) {
    return null;
  }
});
