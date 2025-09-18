import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../models/product.dart';
import '../models/api_response.dart';

class ApiService {
  static const String baseUrl = 'http://192.168.1.22:8000/api/v1';
  static const int timeoutSeconds = 30;

  // Headers
  static const Map<String, String> _headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // GET /products/
  Future<ProductsData> getProducts({
    int limit = 50,
    int page = 1,
    String? search,
    String? category,
  }) async {
    try {
      final queryParams = <String, String>{
        'limit': limit.toString(),
        'page': page.toString(),
      };

      if (search != null && search.isNotEmpty) {
        queryParams['q'] = search;
      }

      if (category != null && category.isNotEmpty) {
        queryParams['filter'] = category;
      }

      final uri = Uri.parse(
        '$baseUrl/products/',
      ).replace(queryParameters: queryParams);

      final response = await http
          .get(uri, headers: _headers)
          .timeout(const Duration(seconds: timeoutSeconds));

      if (response.statusCode == 200) {
        final Map<String, dynamic> jsonData = json.decode(response.body);

        // Handle API response structure: {status, message, data}
        if (jsonData['status'] == 'success' || jsonData['status'] == 'ok') {
          return ProductsData.fromJson(jsonData['data']);
        } else {
          throw ApiException(jsonData['message'] ?? 'Unknown error');
        }
      } else {
        throw ApiException(
          'Failed to fetch products',
          statusCode: response.statusCode,
        );
      }
    } on SocketException {
      throw const ApiException('Internet connection error');
    } on HttpException {
      throw const ApiException('Network error occurred');
    } on FormatException {
      throw const ApiException('Invalid response format');
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Unexpected error: ${e.toString()}');
    }
  }

  // GET /products/:id
  Future<Product> getProduct(int id) async {
    try {
      final uri = Uri.parse('$baseUrl/products/$id');

      final response = await http
          .get(uri, headers: _headers)
          .timeout(const Duration(seconds: timeoutSeconds));

      if (response.statusCode == 200) {
        final Map<String, dynamic> jsonData = json.decode(response.body);

        if (jsonData['status'] == 'success' || jsonData['status'] == 'ok') {
          return Product.fromJson(jsonData['data']);
        } else {
          throw ApiException(jsonData['message'] ?? 'Unknown error');
        }
      } else if (response.statusCode == 404) {
        throw const ApiException('Product not found', statusCode: 404);
      } else {
        throw ApiException(
          'Failed to fetch product details',
          statusCode: response.statusCode,
        );
      }
    } on SocketException {
      throw const ApiException('No internet connection');
    } on HttpException {
      throw const ApiException('Network error occurred');
    } on FormatException {
      throw const ApiException('Invalid response format');
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Unexpected error: ${e.toString()}');
    }
  }

  // POST /ai-summary
  Future<AiSummaryData> getAiSummary(int productId) async {
    try {
      final uri = Uri.parse('$baseUrl/ai-summary/');
      final body = json.encode({'id': productId});

      final response = await http
          .post(uri, headers: _headers, body: body)
          .timeout(const Duration(seconds: timeoutSeconds));

      if (response.statusCode == 200) {
        final Map<String, dynamic> jsonData = json.decode(response.body);

        if (jsonData['status'] == 'success' || jsonData['status'] == 'ok') {
          return AiSummaryData(summary: jsonData['data'] as String);
        } else {
          throw ApiException(jsonData['message'] ?? 'Unknown error');
        }
      } else if (response.statusCode == 404) {
        throw const ApiException(
          'Product not found for AI summary',
          statusCode: 404,
        );
      } else {
        throw ApiException(
          'Failed to get AI summary',
          statusCode: response.statusCode,
        );
      }
    } on SocketException {
      throw const ApiException('Internet connection error');
    } on HttpException {
      throw const ApiException('Network error occurred');
    } on FormatException {
      throw const ApiException('Invalid response format');
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Unexpected error: ${e.toString()}');
    }
  }

  // Search products
  Future<ProductsData> searchProducts({
    required String query,
    int limit = 50,
    int page = 1,
  }) async {
    return getProducts(limit: limit, page: page, search: query);
  }

  // Check internet connectivity
  Future<bool> isConnected() async {
    try {
      final response = await http
          .head(Uri.parse('$baseUrl/products/'))
          .timeout(const Duration(seconds: 5));
      return response.statusCode < 400;
    } catch (e) {
      return false;
    }
  }
}

// Custom exception class for API errors
class ApiException implements Exception {
  final String message;
  final int? statusCode;

  const ApiException(this.message, {this.statusCode});

  @override
  String toString() =>
      'ApiException: $message'
      '${statusCode != null ? ' (Status: $statusCode)' : ''}';
}
