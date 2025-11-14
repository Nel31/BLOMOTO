class Appointment {
  final String id;
  final String clientId;
  final String garageId;
  final String serviceId;
  final DateTime date;
  final String time;
  final String status;
  final String? notes;
  final VehicleInfo? vehicleInfo;

  Appointment({
    required this.id,
    required this.clientId,
    required this.garageId,
    required this.serviceId,
    required this.date,
    required this.time,
    required this.status,
    this.notes,
    this.vehicleInfo,
  });

  factory Appointment.fromJson(Map<String, dynamic> json) {
    return Appointment(
      id: json['_id'] ?? json['id'] ?? '',
      clientId: json['clientId']?['_id'] ?? json['clientId'] ?? '',
      garageId: json['garageId']?['_id'] ?? json['garageId'] ?? '',
      serviceId: json['serviceId']?['_id'] ?? json['serviceId'] ?? '',
      date: DateTime.parse(json['date'] ?? DateTime.now().toIso8601String()),
      time: json['time'] ?? '',
      status: json['status'] ?? 'pending',
      notes: json['notes'],
      vehicleInfo: json['vehicleInfo'] != null
          ? VehicleInfo.fromJson(json['vehicleInfo'])
          : null,
    );
  }

  String get statusLabel {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'confirmed':
        return 'Confirmé';
      case 'in-progress':
        return 'En cours';
      case 'completed':
        return 'Terminé';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  }
}

class VehicleInfo {
  final String? brand;
  final String? model;
  final int? year;
  final String? licensePlate;

  VehicleInfo({
    this.brand,
    this.model,
    this.year,
    this.licensePlate,
  });

  factory VehicleInfo.fromJson(Map<String, dynamic> json) {
    return VehicleInfo(
      brand: json['brand'],
      model: json['model'],
      year: json['year'],
      licensePlate: json['licensePlate'],
    );
  }
}

