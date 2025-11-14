import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/garage_provider.dart';
import '../../models/garage.dart';
import 'garage_detail_screen.dart';

class GarageListScreen extends StatelessWidget {
  const GarageListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Garages à proximité'),
      ),
      body: Consumer<GarageProvider>(
        builder: (context, garageProvider, child) {
          if (garageProvider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (garageProvider.error != null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, size: 64, color: Colors.red),
                  const SizedBox(height: 16),
                  Text('Erreur: ${garageProvider.error}'),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () {
                      // Recharger
                    },
                    child: const Text('Réessayer'),
                  ),
                ],
              ),
            );
          }

          if (garageProvider.garages.isEmpty) {
            return const Center(
              child: Text('Aucun garage trouvé à proximité'),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: garageProvider.garages.length,
            itemBuilder: (context, index) {
              final garage = garageProvider.garages[index];
              return _GarageCard(garage: garage);
            },
          );
        },
      ),
    );
  }
}

class _GarageCard extends StatelessWidget {
  final Garage garage;

  const _GarageCard({required this.garage});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => GarageDetailScreen(garageId: garage.id),
            ),
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      garage.name,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                  ),
                  if (garage.isVerified)
                    const Icon(Icons.verified, color: Colors.blue, size: 20),
                ],
              ),
              const SizedBox(height: 8),
              if (garage.description != null)
                Text(
                  garage.description!,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.location_on, size: 16, color: Colors.grey),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      garage.address.fullAddress,
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.star, size: 16, color: Colors.amber),
                  const SizedBox(width: 4),
                  Text(
                    '${garage.rating.average.toStringAsFixed(1)} (${garage.rating.count})',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  const Spacer(),
                  Text(
                    garage.isActive ? 'Ouvert' : 'Fermé',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: garage.isActive ? Colors.green : Colors.red,
                        ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

