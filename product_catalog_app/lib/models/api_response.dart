import 'package:json_annotation/json_annotation.dart';
import 'product.dart';

part 'api_response.g.dart';

@JsonSerializable(genericArgumentFactories: true)
class ApiResponse<T> {
  final String status;
  final String message;
  final T data;

  const ApiResponse({
    required this.status,
    required this.message,
    required this.data,
  });

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Object? json) fromJsonT,
  ) => _$ApiResponseFromJson(json, fromJsonT);

  Map<String, dynamic> toJson(Object Function(T value) toJsonT) =>
      _$ApiResponseToJson(this, toJsonT);
}

@JsonSerializable()
class ProductsData {
  final List<Product> products;
  final int total;
  final int page;
  final int limit;

  const ProductsData({
    required this.products,
    required this.total,
    required this.page,
    required this.limit,
  });

  factory ProductsData.fromJson(Map<String, dynamic> json) =>
      _$ProductsDataFromJson(json);
  Map<String, dynamic> toJson() => _$ProductsDataToJson(this);
}

@JsonSerializable()
class AiSummaryData {
  final String summary;

  const AiSummaryData({required this.summary});

  factory AiSummaryData.fromJson(Map<String, dynamic> json) =>
      _$AiSummaryDataFromJson(json);
  Map<String, dynamic> toJson() => _$AiSummaryDataToJson(this);
}

@JsonSerializable()
class ApiError {
  final String message;
  final int? statusCode;

  const ApiError({required this.message, this.statusCode});

  factory ApiError.fromJson(Map<String, dynamic> json) =>
      _$ApiErrorFromJson(json);
  Map<String, dynamic> toJson() => _$ApiErrorToJson(this);
}
