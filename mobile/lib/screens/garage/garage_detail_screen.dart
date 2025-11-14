import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/garage_provider.dart';

class GarageDetailScreen extends StatefulWidget {
  final String garageId;

  const GarageDetailScreen({super.key, required this.garageId});

  @override
  State<GarageDetailScreen> createState() => _GarageDetailScreenState();
}

class _GarageDetailScreenState extends State<GarageDetailScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final garageProvider = Provider.of<GarageProvider>(context, listen: false);
      garageProvider.getGarageById(widget.garageId);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Détails du garage'),
      ),
      body: Consumer<GarageProvider>(
        builder: (context, garageProvider, child) {
          if (garageProvider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          final garage = garageProvider.selectedGarage;

          if (garage == null) {
            return const Center(child: Text('Garage non trouvé'));
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  garage.name,
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                const SizedBox(height: 8),
                if (garage.description != null)
                  Text(
                    garage.description!,
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                const SizedBox(height: 16),
                // Ajouter plus de détails ici (images, services, carte, etc.)
              ],
            ),
          );
        },
      ),
    );
  }
}

