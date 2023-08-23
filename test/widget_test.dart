import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:app_bebidas/main.dart';

void main() {
  testWidgets('Test Login and Registration', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(MyApp());

    // Check if Login Page is displayed initially
    expect(find.byType(LoginPage), findsOneWidget);
    expect(find.byType(HomeScreen), findsNothing);

    // Perform Registration
    await tester.tap(find.text('Register'));
    await tester.pumpAndSettle(); // Wait for animations to complete

    expect(find.byType(RegistrationPage), findsOneWidget);
    await tester.enterText(find.byType(TextField).at(0), 'new_username');
    await tester.enterText(find.byType(TextField).at(1), 'new_password');
    await tester.tap(find.text('Register'));
    await tester.pumpAndSettle();

    // Check if HomeScreen is displayed after successful registration
    expect(find.byType(LoginPage), findsNothing);
    expect(find.byType(HomeScreen), findsOneWidget);

    // Perform Logout
    await tester.tap(find.text('Logout'));
    await tester.pumpAndSettle();

    // Check if Login Page is displayed after logout
    expect(find.byType(LoginPage), findsOneWidget);
    expect(find.byType(HomeScreen), findsNothing);

    // Perform Login
    await tester.enterText(find.byType(TextField).at(0), 'new_username');
    await tester.enterText(find.byType(TextField).at(1), 'new_password');
    await tester.tap(find.text('Login'));
    await tester.pumpAndSettle();

    // Check if HomeScreen is displayed after successful login
    expect(find.byType(LoginPage), findsNothing);
    expect(find.byType(HomeScreen), findsOneWidget);
  });
}
