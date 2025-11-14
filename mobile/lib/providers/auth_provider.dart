import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/user.dart';
import '../utils/api_client.dart';

class AuthProvider with ChangeNotifier {
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  final ApiClient _apiClient = ApiClient();

  User? _user;
  bool _isLoading = false;
  String? _error;

  User? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _user != null;

  // Initialiser l'utilisateur depuis le stockage
  Future<void> initUser() async {
    try {
      final token = await _storage.read(key: 'token');
      if (token != null) {
        final response = await _apiClient.get('/auth/me');
        if (response.statusCode == 200) {
          _user = User.fromJson(response.data['user']);
          notifyListeners();
        }
      }
    } catch (e) {
      // Pas connecté ou token invalide
      await _storage.delete(key: 'token');
    }
  }

  // Inscription
  Future<bool> register({
    required String name,
    required String email,
    required String password,
    String? phone,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiClient.post('/auth/register', data: {
        'name': name,
        'email': email,
        'password': password,
        'phone': phone,
      });

      if (response.statusCode == 201) {
        await _storage.write(key: 'token', value: response.data['token']);
        _user = User.fromJson(response.data['user']);
        _isLoading = false;
        _error = null;
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Connexion
  Future<bool> login({
    required String email,
    required String password,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiClient.post('/auth/login', data: {
        'email': email,
        'password': password,
      });

      if (response.statusCode == 200) {
        await _storage.write(key: 'token', value: response.data['token']);
        _user = User.fromJson(response.data['user']);
        _isLoading = false;
        _error = null;
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Déconnexion
  Future<void> logout() async {
    await _storage.delete(key: 'token');
    _user = null;
    _error = null;
    notifyListeners();
  }
}

