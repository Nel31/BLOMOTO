import 'package:flutter/material.dart';
import '../models/garage.dart';
import '../utils/api_client.dart';

class GarageProvider with ChangeNotifier {
  final ApiClient _apiClient = ApiClient();

  List<Garage> _garages = [];
  Garage? _selectedGarage;
  bool _isLoading = false;
  String? _error;

  List<Garage> get garages => _garages;
  Garage? get selectedGarage => _selectedGarage;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Obtenir les garages à proximité
  Future<void> getNearbyGarages({
    required double latitude,
    required double longitude,
    double maxDistance = 10000,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiClient.get('/garages/nearby', queryParameters: {
        'latitude': latitude,
        'longitude': longitude,
        'maxDistance': maxDistance,
      });

      if (response.statusCode == 200) {
        _garages = (response.data['garages'] as List)
            .map((json) => Garage.fromJson(json))
            .toList();
        _isLoading = false;
        _error = null;
        notifyListeners();
      }
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  // Obtenir tous les garages
  Future<void> getAllGarages({String? city}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final queryParams = <String, dynamic>{};
      if (city != null) queryParams['city'] = city;

      final response = await _apiClient.get('/garages', queryParameters: queryParams);

      if (response.statusCode == 200) {
        _garages = (response.data['garages'] as List)
            .map((json) => Garage.fromJson(json))
            .toList();
        _isLoading = false;
        _error = null;
        notifyListeners();
      }
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  // Obtenir un garage par ID
  Future<void> getGarageById(String id) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiClient.get('/garages/$id');

      if (response.statusCode == 200) {
        _selectedGarage = Garage.fromJson(response.data['garage']);
        _isLoading = false;
        _error = null;
        notifyListeners();
      }
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }
}

