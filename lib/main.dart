import 'package:flutter/material.dart';
import 'package:postgres/postgres.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: LoginPage(),
    );
  }
}

class LoginPage extends StatefulWidget {
  @override
  _LoginPageState createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  bool _isLoginInProgress = false;

  void _performLogin() {
    setState(() {
      _isLoginInProgress = true;
    });

    // Perform actual login logic
    // ...

    setState(() {
      _isLoginInProgress = false;
    });
  }

  void _performRegistration() async {
    final db = DatabaseHelper();
    await db.openConnection();

    await db.registerUser(_usernameController.text, _passwordController.text);

    await db.closeConnection();

    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text("Registration Successful"),
          content: Text("User registered successfully."),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
              },
              child: Text("OK"),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Login"),
      ),
      body: Padding(
        padding: EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            TextField(
              controller: _usernameController,
              decoration: InputDecoration(
                labelText: "Username",
              ),
            ),
            SizedBox(height: 16.0),
            TextField(
              controller: _passwordController,
              obscureText: true,
              decoration: InputDecoration(
                labelText: "Password",
              ),
            ),
            SizedBox(height: 16.0),
            ElevatedButton(
              onPressed: _isLoginInProgress ? null : _performLogin,
              child: _isLoginInProgress ? CircularProgressIndicator() : Text("Login"),
            ),
            ElevatedButton(
              onPressed: _isLoginInProgress ? null : _performRegistration,
              child: _isLoginInProgress ? CircularProgressIndicator() : Text("Register"),
            ),
          ],
        ),
      ),
    );
  }
}

class HomeScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Home"),
      ),
      body: Center(
        child: Text("Welcome to the Home Screen!"),
      ),
    );
  }
}

class DatabaseHelper {
  static final DatabaseHelper _instance = DatabaseHelper.internal();

  factory DatabaseHelper() => _instance;

  DatabaseHelper.internal();

  static late PostgreSQLConnection _connection;

  Future<void> openConnection() async {
    _connection = PostgreSQLConnection(
      'localhost',
      5432,
      'App_Bebidas',
      username: 'postgres',
      password: 'CarlosDEV',
    );

    await _connection.open();
  }

  Future<void> closeConnection() async {
    await _connection.close();
  }

  Future<void> registerUser(String username, String password) async {
    await _connection.query(
      'INSERT INTO users (username, password) VALUES (@username, @password)',
      substitutionValues: {
        'username': username,
        'password': password,
      },
    );
  }

  // Add additional database-related methods here
}
