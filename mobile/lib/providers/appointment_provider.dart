import 'package:flutter/material.dart';
import '../models/appointment.dart';
import '../utils/api_client.dart';

class AppointmentProvider with ChangeNotifier {
  final ApiClient _apiClient = ApiClient();

  List<Appointment> _appointments = [];
  bool _isLoading = false;
  String? _error;

  List<Appointment> get appointments => _appointments;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Obtenir les rendez-vous du client
  Future<void> getClientAppointments() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiClient.get('/appointments/client/me');

      if (response.statusCode == 200) {
        _appointments = (response.data['appointments'] as List)
            .map((json) => Appointment.fromJson(json))
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

  // Créer un rendez-vous
  Future<bool> createAppointment({
    required String garageId,
    required String serviceId,
    required DateTime date,
    required String time,
    Map<String, dynamic>? vehicleInfo,
    String? notes,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiClient.post('/appointments', data: {
        'garageId': garageId,
        'serviceId': serviceId,
        'date': date.toIso8601String().split('T')[0],
        'time': time,
        'vehicleInfo': vehicleInfo,
        'notes': notes,
      });

      if (response.statusCode == 201) {
        _isLoading = false;
        _error = null;
        notifyListeners();
        await getClientAppointments(); // Rafraîchir la liste
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

  // Mettre à jour un rendez-vous
  Future<bool> updateAppointment(String id, Map<String, dynamic> data) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiClient.put('/appointments/$id', data: data);

      if (response.statusCode == 200) {
        _isLoading = false;
        _error = null;
        notifyListeners();
        await getClientAppointments();
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

  // Annuler un rendez-vous
  Future<bool> cancelAppointment(String id) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiClient.put('/appointments/$id', data: {
        'status': 'cancelled',
      });

      if (response.statusCode == 200) {
        _isLoading = false;
        _error = null;
        notifyListeners();
        await getClientAppointments();
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
}

