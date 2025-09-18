import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:product_catalog_app/main.dart';

void main() {
  testWidgets('Load product catalogs', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: ProductCatalogApp()));

    expect(find.text('Product Catalog'), findsOneWidget);
  });
}
