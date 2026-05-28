-- =====================================================
-- Prestige Drive — Premium Fleet Seed Data (2026)
-- =====================================================

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE ReviewRatings;
TRUNCATE TABLE Payment;
TRUNCATE TABLE VehicleMaintenance;
TRUNCATE TABLE Rental;
TRUNCATE TABLE LoyaltyProgram;
TRUNCATE TABLE Staff;
TRUNCATE TABLE Customer;
TRUNCATE TABLE Vehicle;
TRUNCATE TABLE Branch;
TRUNCATE TABLE PromoOffer;
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- Branches
-- =====================================================
INSERT INTO Branch (branch_code, name, address, city, country, phone) VALUES
('LON001', 'London Mayfair',           '45 Park Lane',                    'London',   'UK',          '+44-20-7629-0001'),
('PAR002', 'Paris 8th Arrondissement', '8 Avenue Montaigne',              'Paris',    'France',      '+33-1-5367-0002'),
('MON003', 'Monaco Harbour',           '1 Avenue Albert II',              'Monaco',   'Monaco',      '+377-93-15-0003'),
('DXB004', 'Dubai DIFC',               'Gate Avenue, DIFC',               'Dubai',    'UAE',         '+971-4-362-0004'),
('MIL005', 'Milan Brera',              'Via Brera 32',                    'Milan',    'Italy',       '+39-02-8646-0005'),
('GVA006', 'Geneva Paquis',            'Quai du Mont-Blanc 19',           'Geneva',   'Switzerland', '+41-22-716-0006');

-- =====================================================
-- Vehicles — Prestige Drive Ultra-Luxury Fleet
-- =====================================================
INSERT INTO Vehicle (vehicle_code, brand, model, type, fuel_type, transmission, plate_number, status, branch_id, daily_rate, seating_capacity, large_luggage_capacity, small_luggage_capacity, door_count, has_air_conditioning) VALUES
-- London (branch 1)
('LON-RR001',  'Rolls-Royce',    'Phantom VIII',         'Luxury',     'Gasoline', 'Automatic', 'LA71 RRG', 'Available',   1, 1850.00, 5, 3, 4, 4, TRUE),
('LON-RR002',  'Rolls-Royce',    'Ghost Black Badge',    'Luxury',     'Gasoline', 'Automatic', 'LA71 RRH', 'Available',   1, 1650.00, 5, 3, 4, 4, TRUE),
('LON-BN001',  'Bentley',        'Continental GT Speed', 'Sports',     'Gasoline', 'Automatic', 'LA71 BGT', 'Rented',      1, 1450.00, 4, 2, 3, 2, TRUE),
('LON-BN002',  'Bentley',        'Flying Spur W12',      'Luxury',     'Gasoline', 'Automatic', 'LA71 BFS', 'Available',   1, 1250.00, 5, 3, 4, 4, TRUE),
('LON-PO001',  'Porsche',        '911 Turbo S Cabriolet','Convertible','Gasoline', 'Automatic', 'LA71 PTS', 'Available',   1,  980.00, 2, 1, 2, 2, TRUE),
('LON-MB001',  'Mercedes-Benz',  'S680 Maybach',         'Luxury',     'Gasoline', 'Automatic', 'LA71 SMY', 'Rented',      1, 1100.00, 4, 3, 4, 4, TRUE),
('LON-AM001',  'Aston Martin',   'DB12',                 'Sports',     'Gasoline', 'Automatic', 'LA71 ADB', 'Available',   1, 1200.00, 4, 2, 3, 2, TRUE),
('LON-TS001',  'Tesla',          'Model S Plaid',        'Luxury',     'Electric', 'Automatic', 'LA71 TSP', 'Available',   1,  650.00, 5, 2, 3, 4, TRUE),

-- Paris (branch 2)
('PAR-FE001',  'Ferrari',        'Roma Spider',          'Convertible','Gasoline', 'Automatic', '75 AAA 75', 'Available',  2, 2200.00, 2, 1, 2, 2, TRUE),
('PAR-FE002',  'Ferrari',        '296 GTS',              'Convertible','Hybrid',   'Automatic', '75 BBB 75', 'Rented',     2, 2400.00, 2, 1, 2, 2, TRUE),
('PAR-LB001',  'Lamborghini',    'Huracán EVO Spyder',   'Convertible','Gasoline', 'Automatic', '75 CCC 75', 'Available',  2, 2100.00, 2, 1, 2, 2, TRUE),
('PAR-MB001',  'Mercedes-Benz',  'AMG GT 63 S',          'Sports',     'Gasoline', 'Automatic', '75 DDD 75', 'Available',  2,  950.00, 4, 2, 3, 4, TRUE),
('PAR-AU001',  'Audi',           'R8 V10 Performance',   'Sports',     'Gasoline', 'Automatic', '75 EEE 75', 'Maintenance',2, 1050.00, 2, 1, 2, 2, TRUE),
('PAR-PO001',  'Porsche',        'Taycan Turbo S Cross', 'Luxury SUV', 'Electric', 'Automatic', '75 FFF 75', 'Available',  2,  890.00, 5, 2, 3, 4, TRUE),

-- Monaco (branch 3)
('MON-LB001',  'Lamborghini',    'Urus Performante',     'Luxury SUV', 'Gasoline', 'Automatic', 'MC 0001',  'Available',   3, 1800.00, 5, 3, 4, 5, TRUE),
('MON-FE001',  'Ferrari',        'Portofino M',          'Convertible','Gasoline', 'Automatic', 'MC 0002',  'Available',   3, 1950.00, 4, 1, 2, 2, TRUE),
('MON-MA001',  'Maserati',       'GranTurismo Folgore',  'Sports',     'Electric', 'Automatic', 'MC 0003',  'Rented',      3,  950.00, 4, 2, 3, 2, TRUE),
('MON-RR001',  'Rolls-Royce',    'Cullinan Black Badge', 'Luxury SUV', 'Gasoline', 'Automatic', 'MC 0004',  'Available',   3, 2500.00, 5, 4, 5, 5, TRUE),
('MON-PO001',  'Porsche',        'Cayenne Turbo GT',     'Luxury SUV', 'Gasoline', 'Automatic', 'MC 0005',  'Available',   3,  780.00, 5, 3, 4, 5, TRUE),

-- Dubai (branch 4)
('DXB-LB001',  'Lamborghini',    'Urus S',               'Luxury SUV', 'Gasoline', 'Automatic', 'DXB 001',  'Available',   4, 1700.00, 5, 3, 4, 5, TRUE),
('DXB-BN001',  'Bentley',        'Bentayga EWB',         'Luxury SUV', 'Gasoline', 'Automatic', 'DXB 002',  'Rented',      4, 1600.00, 5, 4, 5, 5, TRUE),
('DXB-MB001',  'Mercedes-Benz',  'G63 AMG',              'SUV',        'Gasoline', 'Automatic', 'DXB 003',  'Available',   4,  980.00, 5, 3, 4, 5, TRUE),
('DXB-RR001',  'Rolls-Royce',    'Ghost Extended',       'Luxury',     'Gasoline', 'Automatic', 'DXB 004',  'Rented',      4, 2000.00, 4, 3, 4, 4, TRUE),
('DXB-FE001',  'Ferrari',        '812 GTS',              'Convertible','Gasoline', 'Automatic', 'DXB 005',  'Available',   4, 2800.00, 2, 1, 2, 2, TRUE),
('DXB-PO001',  'Porsche',        '911 GT3 RS',           'Sports',     'Gasoline', 'Automatic', 'DXB 006',  'Available',   4, 1350.00, 2, 1, 2, 2, TRUE),

-- Milan (branch 5)
('MIL-FE001',  'Ferrari',        'SF90 Stradale',        'Sports',     'Hybrid',   'Automatic', 'MI 001 PD', 'Available',  5, 3500.00, 2, 1, 2, 2, TRUE),
('MIL-MA001',  'Maserati',       'Levante Trofeo',       'Luxury SUV', 'Gasoline', 'Automatic', 'MI 002 PD', 'Available',  5,  720.00, 5, 3, 4, 5, TRUE),
('MIL-AU001',  'Audi',           'RS7 Sportback',        'Sports',     'Gasoline', 'Automatic', 'MI 003 PD', 'Rented',     5,  680.00, 5, 2, 3, 4, TRUE),
('MIL-LB001',  'Lamborghini',    'Revuelto',             'Sports',     'Hybrid',   'Automatic', 'MI 004 PD', 'Available',  5, 4200.00, 2, 1, 2, 2, TRUE),
('MIL-BM001',  'BMW',            'M8 Competition',       'Sports',     'Gasoline', 'Automatic', 'MI 005 PD', 'Available',  5,  850.00, 4, 2, 3, 4, TRUE),

-- Geneva (branch 6)
('GVA-BN001',  'Bentley',        'Mulliner Batur',       'Sports',     'Gasoline', 'Automatic', 'GE 001 PD', 'Available',  6, 5500.00, 2, 1, 2, 2, TRUE),
('GVA-RR001',  'Rolls-Royce',    'Spectre',              'Luxury',     'Electric', 'Automatic', 'GE 002 PD', 'Available',  6, 3200.00, 4, 2, 3, 4, TRUE),
('GVA-PO001',  'Porsche',        'Taycan Turbo GT',      'Sports',     'Electric', 'Automatic', 'GE 003 PD', 'Available',  6, 1100.00, 4, 2, 3, 4, TRUE),
('GVA-BM001',  'BMW',            'XM Label Red',         'Luxury SUV', 'Hybrid',   'Automatic', 'GE 004 PD', 'Rented',     6,  920.00, 5, 3, 4, 5, TRUE),
('GVA-MA001',  'McLaren',        '720S Spider',          'Convertible','Gasoline', 'Automatic', 'GE 005 PD', 'Available',  6, 2600.00, 2, 1, 2, 2, TRUE),
('GVA-TS001',  'Tesla',          'Model X Plaid',        'Luxury SUV', 'Electric', 'Automatic', 'GE 006 PD', 'Available',  6,  480.00, 7, 3, 5, 5, TRUE);

-- =====================================================
-- Customers — International HNWI clientele
-- =====================================================
INSERT INTO Customer (customer_code, first_name, last_name, email, phone, date_of_birth, license_number, country_of_residence, is_loyalty_member) VALUES
('CUST001', 'Alexander',  'Whitmore',    'a.whitmore@whitmorecapital.com',   '+44-7700-900001',   '1975-03-12', 'UK-DL-AW75',   'UK',          TRUE),
('CUST002', 'Isabelle',   'Fontaine',    'i.fontaine@maison-fontaine.fr',    '+33-6-1234-0002',   '1982-09-28', 'FR-DL-IF82',   'France',      TRUE),
('CUST003', 'Rashid',     'Al Maktoum',  'rashid@alm-investments.ae',        '+971-50-800-0003',  '1979-06-15', 'UAE-DL-RM79',  'UAE',         TRUE),
('CUST004', 'Valentina',  'Rossi',       'v.rossi@rossi-group.it',           '+39-347-100-0004',  '1988-11-04', 'IT-DL-VR88',   'Italy',       TRUE),
('CUST005', 'Henrik',     'Bergstrom',   'h.bergstrom@bergstromab.se',       '+46-70-200-0005',   '1970-01-22', 'SE-DL-HB70',   'Sweden',      TRUE),
('CUST006', 'Claudia',    'Reichmann',   'c.reichmann@reichmann-bank.de',    '+49-160-300-0006',  '1985-07-09', 'DE-DL-CR85',   'Germany',     TRUE),
('CUST007', 'James',      'Harrington',  'j.harrington@hfm.co.uk',          '+44-7700-900007',   '1968-04-30', 'UK-DL-JH68',   'UK',          TRUE),
('CUST008', 'Natasha',    'Volkov',      'n.volkov@volkov-ventures.com',     '+7-916-800-0008',   '1990-12-17', 'RU-DL-NV90',   'Russia',      TRUE),
('CUST009', 'Omar',       'Shehadeh',    'o.shehadeh@shehadeh.com',          '+962-79-900-0009',  '1977-08-02', 'JO-DL-OS77',   'Jordan',      FALSE),
('CUST010', 'Sophie',     'Delacroix',   's.delacroix@delacroix-corp.fr',    '+33-6-5678-0010',   '1993-05-14', 'FR-DL-SD93',   'France',      TRUE),
('CUST011', 'Marcus',     'Webb',        'm.webb@webbasset.com',             '+1-212-555-0011',   '1972-10-25', 'US-DL-MW72',   'USA',         TRUE),
('CUST012', 'Aiko',       'Tanaka',      'a.tanaka@tanaka-holdings.jp',      '+81-90-1200-0012',  '1984-03-08', 'JP-DL-AT84',   'Japan',       FALSE),
('CUST013', 'Lorenzo',    'Mancini',     'l.mancini@mancini-arte.it',        '+39-340-200-0013',  '1980-06-19', 'IT-DL-LM80',   'Italy',       TRUE),
('CUST014', 'Charlotte',  'Ashford',     'c.ashford@ashfordestates.co.uk',   '+44-7700-900014',   '1987-02-14', 'UK-DL-CA87',   'UK',          TRUE),
('CUST015', 'Sven',       'Lindqvist',   's.lindqvist@lindqvist-pm.ch',      '+41-79-300-0015',   '1965-09-03', 'CH-DL-SL65',   'Switzerland', TRUE),
('CUST016', 'Priya',      'Kapoor',      'p.kapoor@kp-ventures.in',          '+91-98-1000-0016',  '1991-07-22', 'IN-DL-PK91',   'India',       FALSE),
('CUST017', 'Antoine',    'Beaumont',    'a.beaumont@beaumont-fund.mc',      '+377-99-200-0017',  '1976-01-11', 'MC-DL-AB76',   'Monaco',      TRUE),
('CUST018', 'Victoria',   'Sterling',    'v.sterling@sterling-private.com',  '+44-7700-900018',   '1983-04-27', 'UK-DL-VS83',   'UK',          TRUE),
('CUST019', 'Kwame',      'Asante',      'k.asante@asante-capital.gh',       '+233-24-700-0019',  '1978-11-30', 'GH-DL-KA78',   'Ghana',       FALSE),
('CUST020', 'Elena',      'Morozova',    'e.morozova@morozova-invest.ru',    '+7-916-900-0020',   '1989-08-15', 'RU-DL-EM89',   'Russia',      TRUE),
('CUST021', 'Hamad',      'Al Thani',    'hamad@al-thani-family.qa',         '+974-55-300-0021',  '1974-03-18', 'QA-DL-HT74',   'Qatar',       TRUE),
('CUST022', 'Beatrice',   'Schneider',   'b.schneider@schneider-am.ch',      '+41-79-400-0022',   '1995-06-07', 'CH-DL-BS95',   'Switzerland', FALSE),
('CUST023', 'Rafael',     'Dos Santos',  'r.dossantos@rdsinvestimentos.br',  '+55-11-9800-0023',  '1971-12-09', 'BR-DL-RD71',   'Brazil',      TRUE),
('CUST024', 'Mei',        'Zhang',       'm.zhang@zh-family-office.hk',      '+852-9800-0024',    '1986-09-01', 'HK-DL-MZ86',   'Hong Kong',   TRUE),
('CUST025', 'Frederick',  'Okafor',      'f.okafor@okafor-group.ng',         '+234-80-5000-0025', '1980-04-14', 'NG-DL-FO80',   'Nigeria',     FALSE);

-- =====================================================
-- Staff
-- =====================================================
INSERT INTO Staff (staff_code, first_name, last_name, email, position, branch_id, hire_date) VALUES
('STAFF001', 'Edward',   'Clarke',    'e.clarke@prestigedrive.com',    'General Manager',      1, '2021-01-15'),
('STAFF002', 'Amelie',   'Laurent',   'a.laurent@prestigedrive.com',   'Branch Manager',       2, '2021-03-01'),
('STAFF003', 'Matteo',   'Ferrari',   'm.ferrari@prestigedrive.com',   'Branch Manager',       3, '2021-06-15'),
('STAFF004', 'Khalid',   'Hassan',    'k.hassan@prestigedrive.com',    'Branch Manager',       4, '2021-09-01'),
('STAFF005', 'Giulia',   'Romano',    'g.romano@prestigedrive.com',    'Branch Manager',       5, '2022-01-10'),
('STAFF006', 'Thomas',   'Fischer',   't.fischer@prestigedrive.com',   'Branch Manager',       6, '2022-02-20'),
('STAFF007', 'Sophia',   'Marsh',     's.marsh@prestigedrive.com',     'Client Relations',     1, '2022-04-01'),
('STAFF008', 'Lucas',    'Bernard',   'l.bernard@prestigedrive.com',   'Client Relations',     2, '2022-05-15'),
('STAFF009', 'Yasmine',  'Al Rashid', 'y.alrashid@prestigedrive.com',  'Client Relations',     4, '2022-07-01'),
('STAFF010', 'James',    'Whitfield', 'j.whitfield@prestigedrive.com', 'Fleet Coordinator',    1, '2023-01-05');

-- =====================================================
-- Loyalty Program
-- =====================================================
INSERT INTO LoyaltyProgram (customer_id, points_balance, membership_tier, date_joined) VALUES
(1,  18500, 'Platinum', '2021-03-01'),
(2,  12300, 'Platinum', '2021-06-15'),
(3,  24800, 'Diamond',  '2021-01-10'),
(4,   8900, 'Gold',     '2022-02-28'),
(5,  15600, 'Platinum', '2021-08-01'),
(6,   6200, 'Gold',     '2022-05-15'),
(7,  22100, 'Diamond',  '2020-11-20'),
(8,   9800, 'Gold',     '2022-09-01'),
(10, 11400, 'Platinum', '2021-12-01'),
(11, 16700, 'Platinum', '2021-07-15'),
(13,  7300, 'Gold',     '2022-03-10'),
(14, 13900, 'Platinum', '2021-10-05'),
(15, 28600, 'Diamond',  '2020-06-01'),
(17, 19200, 'Diamond',  '2021-04-20'),
(18,  5100, 'Gold',     '2023-01-15'),
(20, 10800, 'Platinum', '2022-06-30'),
(21, 31400, 'Diamond',  '2020-03-15'),
(23, 14200, 'Platinum', '2021-09-10'),
(24, 20500, 'Diamond',  '2020-12-01');

-- =====================================================
-- Rentals — completed (Jan–April 2026) + active/reserved (May–June 2026)
-- =====================================================
INSERT INTO Rental (vehicle_id, customer_id, staff_id, pickup_branch_id, return_branch_id, pickup_datetime, return_datetime, actual_return_datetime, status, booked_via, total_cost, is_one_way, driver_age, deposit_paid_online, payment_due_at_pickup) VALUES
-- Completed Jan 2026
(1,  1,  1, 1, 1, '2026-01-05 10:00:00', '2026-01-12 10:00:00', '2026-01-12 09:45:00', 'Completed', 'Direct',      12950.00, FALSE, 50, 5000.00, 7950.00),
(9,  2,  2, 2, 2, '2026-01-08 14:00:00', '2026-01-11 14:00:00', '2026-01-11 16:00:00', 'Completed', 'Website',      6600.00, FALSE, 43, 2500.00, 4100.00),
(16, 3,  4, 3, 3, '2026-01-10 09:00:00', '2026-01-17 09:00:00', '2026-01-17 08:30:00', 'Completed', 'Direct',      13650.00, FALSE, 46, 5000.00, 8650.00),
(22, 7,  4, 4, 4, '2026-01-14 12:00:00', '2026-01-18 12:00:00', '2026-01-18 14:30:00', 'Completed', 'Phone',        3920.00, FALSE, 57, 1500.00, 2420.00),
(5,  4,  1, 1, 1, '2026-01-20 11:00:00', '2026-01-25 11:00:00', '2026-01-25 10:00:00', 'Completed', 'Website',      4900.00, FALSE, 37, 2000.00, 2900.00),
(28, 15, 5, 5, 5, '2026-01-22 09:00:00', '2026-01-28 09:00:00', '2026-01-28 08:45:00', 'Completed', 'Direct',       4080.00, FALSE, 60, 2000.00, 2080.00),

-- Completed Feb 2026
(2,  5,  1, 1, 1, '2026-02-02 10:00:00', '2026-02-09 10:00:00', '2026-02-09 10:30:00', 'Completed', 'Direct',      11550.00, FALSE, 55, 4500.00, 7050.00),
(14, 6,  2, 2, 2, '2026-02-05 14:00:00', '2026-02-08 14:00:00', '2026-02-08 14:00:00', 'Completed', 'App',          2670.00, FALSE, 40, 1000.00, 1670.00),
(18, 17, 3, 3, 3, '2026-02-10 09:00:00', '2026-02-14 09:00:00', '2026-02-14 09:15:00', 'Completed', 'Direct',      10000.00, FALSE, 49, 4000.00, 6000.00),
(24, 3,  4, 4, 4, '2026-02-12 12:00:00', '2026-02-15 12:00:00', '2026-02-15 11:45:00', 'Completed', 'Direct',       6000.00, FALSE, 46, 2500.00, 3500.00),
(31, 21, 6, 6, 6, '2026-02-18 10:00:00', '2026-02-25 10:00:00', '2026-02-25 09:30:00', 'Completed', 'Direct',      22400.00, FALSE, 51, 8000.00,14400.00),
(10, 2,  2, 2, 2, '2026-02-20 14:00:00', '2026-02-24 14:00:00', '2026-02-24 16:15:00', 'Completed', 'Website',      9600.00, FALSE, 43, 4000.00, 5600.00),

-- Completed Mar 2026
(7,  14, 1, 1, 2, '2026-03-01 10:00:00', '2026-03-06 10:00:00', '2026-03-06 09:55:00', 'Completed', 'Direct',       6000.00, TRUE,  38, 2500.00, 3500.00),
(11, 10, 2, 2, 2, '2026-03-05 14:00:00', '2026-03-10 14:00:00', '2026-03-10 14:00:00', 'Completed', 'App',         10500.00, FALSE, 32, 4000.00, 6500.00),
(19, 17, 3, 3, 3, '2026-03-08 09:00:00', '2026-03-15 09:00:00', '2026-03-15 08:50:00', 'Completed', 'Direct',       5460.00, FALSE, 49, 2500.00, 2960.00),
(25, 21, 4, 4, 4, '2026-03-10 12:00:00', '2026-03-17 12:00:00', '2026-03-17 12:30:00', 'Completed', 'Direct',      19600.00, FALSE, 51, 7000.00,12600.00),
(29, 13, 5, 5, 5, '2026-03-15 09:00:00', '2026-03-20 09:00:00', '2026-03-20 08:45:00', 'Completed', 'Website',      4250.00, FALSE, 45, 2000.00, 2250.00),
(35, 15, 6, 6, 6, '2026-03-20 10:00:00', '2026-03-27 10:00:00', '2026-03-27 10:15:00', 'Completed', 'Direct',       7700.00, FALSE, 60, 3000.00, 4700.00),
(1,  7,  1, 1, 1, '2026-03-22 10:00:00', '2026-03-29 10:00:00', '2026-03-29 09:30:00', 'Completed', 'Direct',      12950.00, FALSE, 57, 5000.00, 7950.00),

-- Completed Apr 2026
(12, 8,  2, 2, 2, '2026-04-01 14:00:00', '2026-04-06 14:00:00', '2026-04-06 13:45:00', 'Completed', 'Direct',       4750.00, FALSE, 35, 2000.00, 2750.00),
(20, 18, 4, 4, 4, '2026-04-03 09:00:00', '2026-04-10 09:00:00', '2026-04-10 08:30:00', 'Completed', 'Direct',       6860.00, FALSE, 42, 2800.00, 4060.00),
(27, 23, 5, 5, 5, '2026-04-07 09:00:00', '2026-04-14 09:00:00', '2026-04-14 09:45:00', 'Completed', 'Website',      4760.00, FALSE, 54, 2000.00, 2760.00),
(33, 24, 6, 6, 6, '2026-04-10 10:00:00', '2026-04-14 10:00:00', '2026-04-14 10:00:00', 'Completed', 'Direct',       4400.00, FALSE, 39, 2000.00, 2400.00),
(4,  11, 1, 1, 1, '2026-04-15 10:00:00', '2026-04-21 10:00:00', '2026-04-21 09:55:00', 'Completed', 'Direct',       7500.00, FALSE, 53, 3000.00, 4500.00),
(16, 21, 3, 3, 3, '2026-04-18 09:00:00', '2026-04-25 09:00:00', '2026-04-25 09:00:00', 'Completed', 'Direct',      13650.00, FALSE, 51, 5000.00, 8650.00),
(8,  1,  1, 1, 1, '2026-04-22 10:00:00', '2026-04-26 10:00:00', '2026-04-26 09:40:00', 'Completed', 'Direct',       4400.00, FALSE, 50, 2000.00, 2400.00),

-- Active rentals — dates relative to NOW() so they never expire as time passes
(3,  14, 1, 1, 1, DATE_SUB(NOW(), INTERVAL 18 DAY), DATE_ADD(NOW(), INTERVAL 7  DAY), NULL, 'Active', 'Direct',  33350.00, FALSE, 38, 10000.00, 23350.00),
(6,  7,  1, 1, 1, DATE_SUB(NOW(), INTERVAL 13 DAY), DATE_ADD(NOW(), INTERVAL 3  DAY), NULL, 'Active', 'Direct',  17600.00, FALSE, 57,  7000.00, 10600.00),
(10, 17, 2, 2, 2, DATE_SUB(NOW(), INTERVAL  8 DAY), DATE_ADD(NOW(), INTERVAL 13 DAY), NULL, 'Active', 'Direct',  48000.00, FALSE, 49, 15000.00, 33000.00),
(17, 2,  3, 3, 3, DATE_SUB(NOW(), INTERVAL  6 DAY), DATE_ADD(NOW(), INTERVAL 8  DAY), NULL, 'Active', 'Phone',   13300.00, FALSE, 43,  5000.00,  8300.00),
(21, 3,  4, 4, 4, DATE_SUB(NOW(), INTERVAL  4 DAY), DATE_ADD(NOW(), INTERVAL 11 DAY), NULL, 'Active', 'Direct',  22400.00, FALSE, 46,  8000.00, 14400.00),
(24, 21, 4, 4, 4, DATE_SUB(NOW(), INTERVAL  3 DAY), DATE_ADD(NOW(), INTERVAL 4  DAY), NULL, 'Active', 'Direct',  14000.00, FALSE, 51,  5000.00,  9000.00),
(34, 15, 6, 6, 6, DATE_SUB(NOW(), INTERVAL  2 DAY), DATE_ADD(NOW(), INTERVAL 5  DAY), NULL, 'Active', 'Direct',   5520.00, FALSE, 60,  2500.00,  3020.00),

-- Reserved — always upcoming relative to NOW()
(1,  5,  1, 1, 1, DATE_ADD(NOW(), INTERVAL 13 DAY), DATE_ADD(NOW(), INTERVAL 20 DAY), NULL, 'Reserved', 'Direct',  12950.00, FALSE, 55, 5000.00, 7950.00),
(9,  6,  2, 2, 2, DATE_ADD(NOW(), INTERVAL 15 DAY), DATE_ADD(NOW(), INTERVAL 18 DAY), NULL, 'Reserved', 'Website',  6600.00, FALSE, 40, 2500.00, 4100.00),
(32, 10, 6, 6, 6, DATE_ADD(NOW(), INTERVAL 18 DAY), DATE_ADD(NOW(), INTERVAL 25 DAY), NULL, 'Reserved', 'Direct',  18200.00, FALSE, 32, 7000.00,11200.00),
(18, 13, 3, 3, 3, DATE_ADD(NOW(), INTERVAL 23 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), NULL, 'Reserved', 'Direct',  17500.00, FALSE, 45, 7000.00,10500.00),
(26, 11, 4, 4, 4, DATE_ADD(NOW(), INTERVAL 28 DAY), DATE_ADD(NOW(), INTERVAL 35 DAY), NULL, 'Reserved', 'Direct',   9800.00, FALSE, 53, 4000.00, 5800.00),
(30, 8,  5, 5, 5, DATE_ADD(NOW(), INTERVAL 34 DAY), DATE_ADD(NOW(), INTERVAL 41 DAY), NULL, 'Reserved', 'App',      4900.00, FALSE, 35, 2000.00, 2900.00);

-- =====================================================
-- Vehicle Maintenance Records
-- =====================================================
INSERT INTO VehicleMaintenance (vehicle_id, description, maintenance_date, cost, performed_by) VALUES
(1,  'Annual service — Rolls-Royce approved technician',    '2026-03-15', 3850.00,  'Rolls-Royce Mayfair Service'),
(2,  '30,000 km full service and detailing',               '2026-02-20', 2800.00,  'Rolls-Royce Mayfair Service'),
(3,  'Brake system inspection and pad replacement',        '2026-04-01', 1950.00,  'Bentley London'),
(5,  'PDK gearbox fluid change and inspection',            '2026-03-28', 1250.00,  'Porsche Centre London'),
(7,  'Full valet, paint correction and ceramic coat',      '2026-04-10', 4200.00,  'Prestige Detail Studio'),
(8,  'Service A — battery diagnostics and update',        '2026-01-05', 450.00,   'Tesla Service London'),
(13, 'Engine 60,000 km service — all fluids replaced',    '2026-01-20', 2950.00,  'Audi Centre Paris'),
(14, 'Wheel alignment, tire rotation, brake flush',        '2026-02-14', 880.00,   'Mercedes AMG Partner Paris'),
(16, 'Pre-season inspection and cabin deep clean',         '2026-03-01', 1600.00,  'Prestige Drive Monaco'),
(19, 'GranTurismo 20,000 km scheduled service',           '2026-04-15', 1850.00,  'Maserati Monaco'),
(21, 'Full service — Lamborghini certified',              '2026-02-28', 3200.00,  'Lamborghini Dubai'),
(22, 'Annual service and brake upgrade',                  '2026-03-18', 2400.00,  'Bentley Dubai'),
(23, 'G63 off-road kit inspection and wheel service',     '2026-04-05', 1100.00,  'Mercedes AMG Dubai'),
(27, 'RS7 annual service and software calibration',       '2026-02-10', 2100.00,  'Audi Milan'),
(29, 'M8 Competition full annual + PPF inspection',       '2026-03-25', 1900.00,  'BMW Milan'),
(33, 'Taycan 720S 15,000 km scheduled service',          '2026-01-28', 1450.00,  'Porsche Centre Geneva');

-- =====================================================
-- Payments (deposits for completed + active rentals)
-- =====================================================
INSERT INTO Payment (rental_id, amount, payment_date, payment_method, is_successful) VALUES
(1,  5000.00, '2025-12-28', 'Wire Transfer',  TRUE),
(1,  7950.00, '2026-01-05', 'Credit Card',    TRUE),
(2,  2500.00, '2025-12-30', 'Credit Card',    TRUE),
(2,  4100.00, '2026-01-08', 'Credit Card',    TRUE),
(3,  5000.00, '2025-12-31', 'Wire Transfer',  TRUE),
(3,  8650.00, '2026-01-10', 'Wire Transfer',  TRUE),
(4,  1500.00, '2026-01-08', 'Credit Card',    TRUE),
(4,  2420.00, '2026-01-14', 'Credit Card',    TRUE),
(5,  2000.00, '2026-01-14', 'Credit Card',    TRUE),
(5,  2900.00, '2026-01-20', 'Credit Card',    TRUE),
(6,  2000.00, '2026-01-15', 'Wire Transfer',  TRUE),
(6,  2080.00, '2026-01-22', 'Wire Transfer',  TRUE),
(7,  4500.00, '2026-01-27', 'Wire Transfer',  TRUE),
(7,  7050.00, '2026-02-02', 'Wire Transfer',  TRUE),
(8,  1000.00, '2026-01-29', 'Credit Card',    TRUE),
(8,  1670.00, '2026-02-05', 'Credit Card',    TRUE),
(9,  4000.00, '2026-02-03', 'Wire Transfer',  TRUE),
(9,  6000.00, '2026-02-10', 'Wire Transfer',  TRUE),
(10, 2500.00, '2026-02-05', 'Credit Card',    TRUE),
(10, 3500.00, '2026-02-12', 'Credit Card',    TRUE),
(11, 8000.00, '2026-02-11', 'Wire Transfer',  TRUE),
(11,14400.00, '2026-02-18', 'Wire Transfer',  TRUE),
(12, 4000.00, '2026-02-13', 'Credit Card',    TRUE),
(12, 5600.00, '2026-02-20', 'Credit Card',    TRUE),
-- Deposits for active rentals
(29,10000.00, '2026-05-03', 'Wire Transfer',  TRUE),
(30, 7000.00, '2026-05-08', 'Wire Transfer',  TRUE),
(31,15000.00, '2026-05-13', 'Wire Transfer',  TRUE),
(32, 5000.00, '2026-05-15', 'Wire Transfer',  TRUE),
(33, 8000.00, '2026-05-17', 'Wire Transfer',  TRUE),
(34, 5000.00, '2026-05-18', 'Wire Transfer',  TRUE),
(35, 2500.00, '2026-05-19', 'Credit Card',    TRUE);

-- =====================================================
-- Review Ratings
-- =====================================================
INSERT INTO ReviewRatings (rental_id, rating_score, review_text, review_date) VALUES
(1,  5.0, 'Immaculate. The Phantom was flawlessly presented and the Mayfair team exceeded every expectation.',         '2026-01-13'),
(2,  4.8, 'Ferrari Roma delivered exactly the Paris experience I was hoping for. Concierge pickup was seamless.',      '2026-01-12'),
(3,  5.0, 'Cullinan in Monaco — the only way to arrive. Prestige Drive sets a new benchmark for premium rentals.',    '2026-01-18'),
(5,  4.7, 'The 911 Turbo Cabriolet was in perfect condition. Highly recommend for anyone visiting London.',            '2026-01-26'),
(7,  5.0, 'Ghost Black Badge. Absolute perfection. The team even arranged a chauffeur for the first evening.',         '2026-02-10'),
(9,  4.9, 'Rolls-Royce Cullinan in Monaco — we brought the whole family and the car was magnificent.',                '2026-02-15'),
(11, 4.8, 'Spectre in Geneva — whisper quiet and devastatingly handsome. The EV experience of the century.',          '2026-02-26'),
(14, 5.0, 'Ferrari SF90 in Paris? Dreams come true with Prestige Drive.',                                             '2026-03-11'),
(19, 4.6, 'Cayenne Turbo GT in Monaco. Brilliant for the mountain roads. Excellent service from start to finish.',     '2026-03-16');

-- =====================================================
-- Promo Offers
-- =====================================================
INSERT INTO PromoOffer (name, discount_percent, valid_from, valid_to, conditions) VALUES
('Diamond Member Exclusive',   20, '2026-01-01', '2026-12-31', 'Diamond tier members only, minimum 7-day rental'),
('Monaco Grand Prix Weekend',  10, '2026-05-22', '2026-05-26', 'Monaco branch, minimum 4-day rental during GP weekend'),
('Summer Collection 2026',     12, '2026-07-01', '2026-08-31', 'All branches, supercar category, minimum 5 days'),
('New Client Welcome',         15, '2026-01-01', '2026-12-31', 'First rental with Prestige Drive, any vehicle'),
('Extended Tour',               8, '2026-01-01', '2026-12-31', 'Any rental of 14 days or more, all categories');

SET FOREIGN_KEY_CHECKS = 1;
