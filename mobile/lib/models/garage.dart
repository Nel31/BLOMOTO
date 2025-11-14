class Garage {
  final String id;
  final String name;
  final String? description;
  final String ownerId;
  final Address address;
  final Location location;
  final String phone;
  final String? email;
  final String? website;
  final List<String> images;
  final Rating rating;
  final OpeningHours? openingHours;
  final bool isVerified;
  final bool isActive;

  Garage({
    required this.id,
    required this.name,
    this.description,
    required this.ownerId,
    required this.address,
    required this.location,
    required this.phone,
    this.email,
    this.website,
    required this.images,
    required this.rating,
    this.openingHours,
    required this.isVerified,
    required this.isActive,
  });

  factory Garage.fromJson(Map<String, dynamic> json) {
    return Garage(
      id: json['_id'] ?? json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'],
      ownerId: json['ownerId']?['_id'] ?? json['ownerId'] ?? '',
      address: Address.fromJson(json['address'] ?? {}),
      location: Location.fromJson(json['location'] ?? {}),
      phone: json['phone'] ?? '',
      email: json['email'],
      website: json['website'],
      images: List<String>.from(json['images'] ?? []),
      rating: Rating.fromJson(json['rating'] ?? {}),
      openingHours: json['openingHours'] != null
          ? OpeningHours.fromJson(json['openingHours'])
          : null,
      isVerified: json['isVerified'] ?? false,
      isActive: json['isActive'] ?? true,
    );
  }
}

class Address {
  final String street;
  final String city;
  final String postalCode;
  final String country;

  Address({
    required this.street,
    required this.city,
    required this.postalCode,
    this.country = 'France',
  });

  factory Address.fromJson(Map<String, dynamic> json) {
    return Address(
      street: json['street'] ?? '',
      city: json['city'] ?? '',
      postalCode: json['postalCode'] ?? '',
      country: json['country'] ?? 'France',
    );
  }

  String get fullAddress => '$street, $postalCode $city, $country';
}

class Location {
  final String type;
  final List<double> coordinates; // [longitude, latitude]

  Location({
    this.type = 'Point',
    required this.coordinates,
  });

  factory Location.fromJson(Map<String, dynamic> json) {
    return Location(
      type: json['type'] ?? 'Point',
      coordinates: List<double>.from(json['coordinates'] ?? [0.0, 0.0]),
    );
  }

  double get longitude => coordinates.isNotEmpty ? coordinates[0] : 0.0;
  double get latitude => coordinates.length > 1 ? coordinates[1] : 0.0;
}

class Rating {
  final double average;
  final int count;

  Rating({
    this.average = 0.0,
    this.count = 0,
  });

  factory Rating.fromJson(Map<String, dynamic> json) {
    return Rating(
      average: (json['average'] ?? 0).toDouble(),
      count: json['count'] ?? 0,
    );
  }
}

class OpeningHours {
  final Map<String, DayHours> hours;

  OpeningHours({required this.hours});

  factory OpeningHours.fromJson(Map<String, dynamic> json) {
    Map<String, DayHours> hours = {};
    for (var day in ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']) {
      if (json[day] != null) {
        hours[day] = DayHours.fromJson(json[day]);
      }
    }
    return OpeningHours(hours: hours);
  }
}

class DayHours {
  final String open;
  final String close;
  final bool closed;

  DayHours({
    required this.open,
    required this.close,
    required this.closed,
  });

  factory DayHours.fromJson(Map<String, dynamic> json) {
    return DayHours(
      open: json['open'] ?? '09:00',
      close: json['close'] ?? '18:00',
      closed: json['closed'] ?? false,
    );
  }
}

