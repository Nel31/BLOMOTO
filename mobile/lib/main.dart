import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'providers/auth_provider.dart';
import 'providers/garage_provider.dart';
import 'providers/appointment_provider.dart';
import 'screens/splash_screen.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/register_screen.dart';
import 'screens/home/home_screen.dart';
import 'screens/garage/garage_list_screen.dart';
import 'screens/garage/garage_detail_screen.dart';
import 'screens/appointment/appointment_list_screen.dart';
import 'screens/profile/profile_screen.dart';
import 'utils/theme.dart';

void main() {
  runApp(const PromotoApp());
}

class PromotoApp extends StatelessWidget {
  const PromotoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => GarageProvider()),
        ChangeNotifierProvider(create: (_) => AppointmentProvider()),
      ],
      child: MaterialApp(
        title: 'Promoto',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        initialRoute: '/',
        routes: {
          '/': (context) => const SplashScreen(),
          '/login': (context) => const LoginScreen(),
          '/register': (context) => const RegisterScreen(),
          '/home': (context) => const HomeScreen(),
          '/garages': (context) => const GarageListScreen(),
          '/garage-detail': (context) => const GarageDetailScreen(),
          '/appointments': (context) => const AppointmentListScreen(),
          '/profile': (context) => const ProfileScreen(),
        },
      ),
    );
  }
}

