<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';

date_default_timezone_set('Asia/Manila');

const DEBUG = true;

const CAR_STOCK = 10;

const DELIVERY_BASE   = 500;
const DELIVERY_PER_KM = 12;
const LOCATIONS = [
    "Automigz Main Office — Cabanatuan City",
];

function cars_base(): array {
    return [
        ['id'=>1,'name'=>'Toyota Fortuner','type'=>'SUV','price'=>4500,'trans'=>'Automatic Transmission','img'=>'images/SUV-T.Furtuner.png',
         'info'=>'7-seater SUV · 2.8L Diesel · 201 HP · Perfect for family trips',
         'colors'=>[['n'=>'White','h'=>'#f4f4f4'],['n'=>'Grey','h'=>'#8e9096'],['n'=>'Black','h'=>'#191a1c']]],
        ['id'=>2,'name'=>'Nissan Terra','type'=>'SUV','price'=>8000,'trans'=>'Automatic Transmission','img'=>'images/vehicle-placeholder.svg',
         'info'=>'7-seater SUV · 2.8L Diesel · 201 HP · Built for heavy duty',
         'colors'=>[['n'=>'White','h'=>'#f4f4f4'],['n'=>'Grey','h'=>'#8e9096'],['n'=>'Black','h'=>'#191a1c']]],
         ['id'=>3,'name'=>'Mitsubishi Montero','type'=>'SUV','price'=>8000,'trans'=>'Automatic Transmission','img'=>'images/vehicle-placeholder.svg',
         'info'=>'7-seater SUV · 2.8L Diesel · 201 HP · Built for heavy duty',
         'colors'=>[['n'=>'White','h'=>'#f4f4f4'],['n'=>'Grey','h'=>'#8e9096'],['n'=>'Black','h'=>'#191a1c']]],
         ['id'=>4,'name'=>'Isuzu MUX','type'=>'SUV','price'=>8000,'trans'=>'Automatic Transmission','img'=>'images/vehicle-placeholder.svg',
         'info'=>'7-seater SUV · 2.8L Diesel · 201 HP · Built for heavy duty',
         'colors'=>[['n'=>'White','h'=>'#f4f4f4'],['n'=>'Grey','h'=>'#8e9096'],['n'=>'Black','h'=>'#191a1c']]],
         ['id'=>5,'name'=>'Ford Everest','type'=>'SUV','price'=>8000,'trans'=>'Automatic Transmission','img'=>'images/vehicle-placeholder.svg',
         'info'=>'7-seater SUV · 2.8L Diesel · 201 HP · Built for heavy duty',
         'colors'=>[['n'=>'White','h'=>'#f4f4f4'],['n'=>'Grey','h'=>'#8e9096'],['n'=>'Black','h'=>'#191a1c']]],

         ['id'=>6,'name'=>'Toyota Hilux','type'=>'Pick-up','price'=>3500,'trans'=>'Automatic Transmission','img'=>'images/Pick up1.png',
         'info'=>'4x4 pick-up · 2.8L Diesel · 201 HP · Built for heavy duty',
         'colors'=>[['n'=>'White','h'=>'#f4f4f4'],['n'=>'Grey','h'=>'#8e9096'],['n'=>'Black','h'=>'#191a1c']]],
         ['id'=>7,'name'=>'Ford Ranger','type'=>'Pick-up','price'=>4000,'trans'=>'Automatic Transmission','img'=>'images/Pick up.png',
         'info'=>'4x4 pick-up · 2.0L Diesel · 168 HP · Built for heavy duty',
         'colors'=>[['n'=>'White','h'=>'#f4f4f4'],['n'=>'Grey','h'=>'#8e9096'],['n'=>'Black','h'=>'#191a1c']]],
         ['id'=>8,'name'=>'Nissan Navarra','type'=>'Pick-up','price'=>3000,'trans'=>'Automatic Transmission','img'=>'images/Pick up-N.Navara.png',
         'info'=>'4x4 pick-up · 2.5L Diesel · 187 HP · Built for heavy duty',
         'colors'=>[['n'=>'White','h'=>'#f4f4f4'],['n'=>'Grey','h'=>'#8e9096'],['n'=>'Black','h'=>'#191a1c']]],
         ['id'=>9,'name'=>'Mitsubishi Triton','type'=>'Pick-up','price'=>3500,'trans'=>'Automatic Transmission','img'=>'images/Pick up-T.Triton.png',
         'info'=>'4x4 pick-up · 2.4L Diesel · 178 HP · Built for heavy duty',
         'colors'=>[['n'=>'White','h'=>'#f4f4f4'],['n'=>'Grey','h'=>'#8e9096'],['n'=>'Black','h'=>'#191a1c']]],
         ['id'=>10,'name'=>'Isuzu D-Max','type'=>'Pick-up','price'=>3000,'trans'=>'Automatic Transmission','img'=>'images/vehicle-placeholder.svg',
         'info'=>'4x4 pick-up · 3.0L Diesel · 187 HP · Built for heavy duty',
         'colors'=>[['n'=>'White','h'=>'#f4f4f4'],['n'=>'Grey','h'=>'#8e9096'],['n'=>'Black','h'=>'#191a1c']]],

         ['id'=>11,'name'=>'Toyota HiAce Commuter','type'=>'Van','price'=>4500,'trans'=>'Automatic Transmission','img'=>'images/van2-T.Grand.png',
         'info'=>'4x4 pick-up · 2.8L Diesel · 174 HP · Built for heavy duty',
         'colors'=>[['n'=>'White','h'=>'#f4f4f4'],['n'=>'Grey','h'=>'#8e9096'],['n'=>'Black','h'=>'#191a1c']]],
         ['id'=>12,'name'=>'Nissan NV350 Urvan','type'=>'Van','price'=>4500,'trans'=>'Automatic Transmission','img'=>'images/vehicle-placeholder.svg',
         'info'=>'4x4 pick-up · 2.5L Diesel · 127 HP · Built for heavy duty',
         'colors'=>[['n'=>'White','h'=>'#f4f4f4'],['n'=>'Grey','h'=>'#8e9096'],['n'=>'Black','h'=>'#191a1c']]],
         ['id'=>13,'name'=>'Toyota HiAce Grandia','type'=>'Van','price'=>5500,'trans'=>'Automatic Transmission','img'=>'images/Van.png',
         'info'=>'4x4 pick-up · 2.8L Diesel · 174 HP · Built for heavy duty',
         'colors'=>[['n'=>'White','h'=>'#f4f4f4'],['n'=>'Grey','h'=>'#8e9096'],['n'=>'Black','h'=>'#191a1c']]],
         ['id'=>14,'name'=>'Hyundai Staria','type'=>'Van','price'=>5000,'trans'=>'Automatic Transmission','img'=>'images/vehicle-placeholder.svg',
         'info'=>'4x4 pick-up · 2.2L Diesel · 175 HP · Built for heavy duty',
         'colors'=>[['n'=>'White','h'=>'#f4f4f4'],['n'=>'Grey','h'=>'#8e9096'],['n'=>'Black','h'=>'#191a1c']]],
         ['id'=>15,'name'=>'Hyundai Grand Starex','type'=>'Van','price'=>4000,'trans'=>'Automatic Transmission','img'=>'images/vehicle-placeholder.svg',
         'info'=>'4x4 pick-up · 2.5L Diesel · 168 HP · Built for heavy duty',
         'colors'=>[['n'=>'White','h'=>'#f4f4f4'],['n'=>'Grey','h'=>'#8e9096'],['n'=>'Black','h'=>'#191a1c']]],

         ['id'=>16,'name'=>'Toyota Vios','type'=>'Sedan','price'=>1500,'trans'=>'Automatic Transmission','img'=>'images/sedan2.png',
         'info'=>'Daily Use Sedan · 1.5L Gasoline · 106 HP · Built for heavy duty',
         'colors'=>[['n'=>'White','h'=>'#f4f4f4'],['n'=>'Grey','h'=>'#8e9096'],['n'=>'Black','h'=>'#191a1c']]],
         ['id'=>17,'name'=>'Honda City','type'=>'Sedan','price'=>2000,'trans'=>'Automatic Transmission','img'=>'images/sedan1.png',
         'info'=>'Daily Use Sedan · 1.5L Gasoline · 119 HP · Built for heavy duty',
         'colors'=>[['n'=>'White','h'=>'#f4f4f4'],['n'=>'Grey','h'=>'#8e9096'],['n'=>'Black','h'=>'#191a1c']]],
         ['id'=>18,'name'=>'Mitsubishi Mirage G4','type'=>'Sedan','price'=>1500,'trans'=>'Automatic Transmission','img'=>'images/sedan3.png',
         'info'=>'Daily Use Sedan · 1.2L Gasoline · 78 HP · Built for heavy duty',
         'colors'=>[['n'=>'White','h'=>'#f4f4f4'],['n'=>'Grey','h'=>'#8e9096'],['n'=>'Black','h'=>'#191a1c']]],
         ['id'=>19,'name'=>'Toyota Corolla Altis','type'=>'Sedan','price'=>2500,'trans'=>'Automatic Transmission','img'=>'images/sedan4.png',
         'info'=>'Daily Use Sedan · 1.8L Gasoline · 138 HP · Built for heavy duty',
         'colors'=>[['n'=>'White','h'=>'#f4f4f4'],['n'=>'Grey','h'=>'#8e9096'],['n'=>'Black','h'=>'#191a1c']]],
         ['id'=>20,'name'=>'Nissan Almera','type'=>'Sedan','price'=>1800,'trans'=>'Automatic Transmission','img'=>'images/sedan.png',
         'info'=>'Daily Use Sedan · 1.0L Gasoline · 99 HP · Built for heavy duty',
         'colors'=>[['n'=>'White','h'=>'#f4f4f4'],['n'=>'Grey','h'=>'#8e9096'],['n'=>'Black','h'=>'#191a1c']]],

         ['id'=>21,'name'=>'Toyota Innova','type'=>'MPV','price'=>3000,'trans'=>'Automatic Transmission','img'=>'images/vehicle-placeholder.svg',
         'info'=>'7 seater MPV · 2.8L Diesel · 171 HP · Built for heavy duty',
         'colors'=>[['n'=>'White','h'=>'#f4f4f4'],['n'=>'Grey','h'=>'#8e9096'],['n'=>'Black','h'=>'#191a1c']]],
         ['id'=>22,'name'=>'Mitsubishi Xpander','type'=>'MPV','price'=>2500,'trans'=>'Automatic Transmission','img'=>'images/vehicle-placeholder.svg',
         'info'=>'7 seater MPV · 1.5L Gasoline · 103 HP · Built for heavy duty',
         'colors'=>[['n'=>'White','h'=>'#f4f4f4'],['n'=>'Grey','h'=>'#8e9096'],['n'=>'Black','h'=>'#191a1c']]],
         ['id'=>23,'name'=>'Toyota Avanza','type'=>'MPV','price'=>2000,'trans'=>'Automatic Transmission','img'=>'images/vehicle-placeholder.svg',
         'info'=>'7 seater MPV · 1.5L Gasoline · 105 HP · Built for heavy duty',
         'colors'=>[['n'=>'White','h'=>'#f4f4f4'],['n'=>'Grey','h'=>'#8e9096'],['n'=>'Black','h'=>'#191a1c']]],
         ['id'=>24,'name'=>'Toyota Rush','type'=>'MPV','price'=>2500,'trans'=>'Automatic Transmission','img'=>'images/vehicle-placeholder.svg',
         'info'=>'7 seater MPV · 1.5L Gasoline · 101 HP · Built for heavy duty',
         'colors'=>[['n'=>'White','h'=>'#f4f4f4'],['n'=>'Grey','h'=>'#8e9096'],['n'=>'Black','h'=>'#191a1c']]],
         ['id'=>25,'name'=>'Suzuki Ertiga','type'=>'MPV','price'=>2000,'trans'=>'Automatic Transmission','img'=>'images/vehicle-placeholder.svg',
         'info'=>'7 seater MPV · 1.5L Gasoline · 103 HP · Built for heavy duty',
         'colors'=>[['n'=>'White','h'=>'#f4f4f4'],['n'=>'Grey','h'=>'#8e9096'],['n'=>'Black','h'=>'#191a1c']]],

         ['id'=>26,'name'=>'BYD Dolphin','type'=>'Electric','price'=>8000,'trans'=>'Automatic Transmission','img'=>'images/vehicle-placeholder.svg',
         'info'=>'EV Car· N/A - Electric · 94-201 HP · Built for heavy duty',
         'colors'=>[['n'=>'White','h'=>'#f4f4f4'],['n'=>'Grey','h'=>'#8e9096'],['n'=>'Black','h'=>'#191a1c']]],
         ['id'=>27,'name'=>'BYD Atto 3','type'=>'Electric','price'=>8000,'trans'=>'Automatic Transmission','img'=>'images/vehicle-placeholder.svg',
         'info'=>'EV Car· N/A - Electric · 201 HP · Built for heavy duty',
         'colors'=>[['n'=>'White','h'=>'#f4f4f4'],['n'=>'Grey','h'=>'#8e9096'],['n'=>'Black','h'=>'#191a1c']]],
         ['id'=>28,'name'=>'MG4 EV','type'=>'Electric','price'=>8000,'trans'=>'Automatic Transmission','img'=>'images/vehicle-placeholder.svg',
         'info'=>'EV Car· N/A - Electric · 168-241 HP · Built for heavy duty',
         'colors'=>[['n'=>'White','h'=>'#f4f4f4'],['n'=>'Grey','h'=>'#8e9096'],['n'=>'Black','h'=>'#191a1c']]],
         ['id'=>29,'name'=>'Tesla Model 3','type'=>'Electric','price'=>8000,'trans'=>'Automatic Transmission','img'=>'images/vehicle-placeholder.svg',
         'info'=>'EV Car· N/A - Electric · 260-510 HP · Built for heavy duty',
         'colors'=>[['n'=>'White','h'=>'#f4f4f4'],['n'=>'Grey','h'=>'#8e9096'],['n'=>'Black','h'=>'#191a1c']]],
         ['id'=>30,'name'=>'BYD Seal','type'=>'Electric','price'=>8000,'trans'=>'Automatic Transmission','img'=>'images/vehicle-placeholder.svg',
         'info'=>'EV Car· N/A - Electric · 201-523 HP · Built for heavy duty',
         'colors'=>[['n'=>'White','h'=>'#f4f4f4'],['n'=>'Grey','h'=>'#8e9096'],['n'=>'Black','h'=>'#191a1c']]],

         ['id'=>31,'name'=>'Ford Mustang GT','type'=>'Luxury','price'=>12000,'trans'=>'Automatic Transmission','img'=>'images/vehicle-placeholder.svg',
         'info'=>'4x4 pick-up · 5.0L Gasoline · 480 HP · Built for heavy duty',
         'colors'=>[['n'=>'White','h'=>'#f4f4f4'],['n'=>'Grey','h'=>'#8e9096'],['n'=>'Black','h'=>'#191a1c']]],
         ['id'=>32,'name'=>'BMW 330i','type'=>'Luxury','price'=>10000,'trans'=>'Automatic Transmission','img'=>'images/vehicle-placeholder.svg',
         'info'=>'4x4 pick-up · 2.0L Gasoline · 255 HP · Built for heavy duty',
         'colors'=>[['n'=>'White','h'=>'#f4f4f4'],['n'=>'Grey','h'=>'#8e9096'],['n'=>'Black','h'=>'#191a1c']]],
         ['id'=>33,'name'=>'Mercedes-Benz C-Class','type'=>'Luxury','price'=>12000,'trans'=>'Automatic Transmission','img'=>'images/vehicle-placeholder.svg',
         'info'=>'4x4 pick-up · 2.0L Gasoline · 255 HP · Built for heavy duty',
         'colors'=>[['n'=>'White','h'=>'#f4f4f4'],['n'=>'Grey','h'=>'#8e9096'],['n'=>'Black','h'=>'#191a1c']]],
         ['id'=>34,'name'=>'Toyota GR Supra','type'=>'Luxury','price'=>15000,'trans'=>'Automatic Transmission','img'=>'images/vehicle-placeholder.svg',
         'info'=>'4x4 pick-up · 3.0L Gasoline · 382 HP · Built for heavy duty',
         'colors'=>[['n'=>'White','h'=>'#f4f4f4'],['n'=>'Grey','h'=>'#8e9096'],['n'=>'Black','h'=>'#191a1c']]],
         ['id'=>35,'name'=>'Porsche 911','type'=>'Luxury','price'=>25000,'trans'=>'Automatic Transmission','img'=>'images/vehicle-placeholder.svg',
         'info'=>'4x4 pick-up · 3.0L Gasoline · 388 HP · Built for heavy duty',
         'colors'=>[['n'=>'White','h'=>'#f4f4f4'],['n'=>'Grey','h'=>'#8e9096'],['n'=>'Black','h'=>'#191a1c']]],




























    ];
}

function slug(string $t): string { return trim(preg_replace('/[^a-z0-9]+/', '-', strtolower($t)), '-'); }
function color_photo(string $carName, string $colorName): ?string {
    $root = __DIR__ . '/images/colors';
    if (!is_dir($root)) return null;
    foreach (scandir($root) as $dir) {
        if ($dir[0] === '.' || !is_dir("$root/$dir") || slug($dir) !== slug($carName)) continue;
        foreach (scandir("$root/$dir") as $f) {
            if (!preg_match('/\.(png|jpe?g|webp)$/i', $f)) continue;
            $name = preg_replace('/(\.(png|jpe?g|webp))+$/i', '', $f);
            if (slug($name) === slug($colorName)) return 'images/colors/' . rawurlencode($dir) . '/' . rawurlencode($f) . '?v=' . filemtime("$root/$dir/$f");
        }
    }
    return null;
}

function landing_photo(string $carName): ?string {
    $root = __DIR__ . '/images/landing';
    if (!is_dir($root)) return null;
    foreach (scandir($root) as $f) {
        if (!preg_match('/\.(png|jpe?g|webp)$/i', $f)) continue;
        $name = preg_replace('/(\.(png|jpe?g|webp))+$/i', '', $f);
        if (slug($name) === slug($carName)) return 'images/landing/' . rawurlencode($f) . '?v=' . filemtime("$root/$f");
    }
    return null;
}

function stock_info(): array {
    $st = db()->prepare("SELECT car_id, qty, ret_date FROM bookings WHERE status = 'active' AND ret_date >= ? ORDER BY ret_date ASC");
    $st->execute([date('Y-m-d')]);
    $used = []; $first = [];
    foreach ($st->fetchAll() as $r) {
        $id = (int)$r['car_id'];
        $used[$id] = ($used[$id] ?? 0) + (int)$r['qty'];
        if (!isset($first[$id])) $first[$id] = $r['ret_date'];
    }
    $out = [];
    foreach ($used as $id => $n) {
        $left = max(0, CAR_STOCK - $n);
        $out[$id] = ['total'=>CAR_STOCK, 'left'=>$left, 'next'=>$left === 0 ? date('Y-m-d', strtotime($first[$id] . ' +1 day')) : null];
    }
    return $out;
}
function stock_of(int $carId): array {
    return stock_info()[$carId] ?? ['total'=>CAR_STOCK, 'left'=>CAR_STOCK, 'next'=>null];
}

function cars(): array {
    $list = cars_base();
    $stock = stock_info();
    foreach ($list as &$car) {
        $car['stock'] = $stock[$car['id']] ?? ['total'=>CAR_STOCK, 'left'=>CAR_STOCK, 'next'=>null];
        $landing = landing_photo($car['name']);
        if ($landing) $car['landing'] = $landing;
        foreach ($car['colors'] as &$col) {
            $photo = color_photo($car['name'], $col['n']);
            if ($photo) $col['img'] = $photo;
        }
        unset($col);
        if (!is_file(__DIR__ . '/' . rawurldecode(strtok($car['img'], '?')))) {
            foreach ($car['colors'] as $col) {
                if (!empty($col['img'])) { $car['img'] = $col['img']; break; }
            }
            unset($col);
            if (!is_file(__DIR__ . '/' . rawurldecode(strtok($car['img'], '?')))) $car['img'] = 'images/vehicle-placeholder.svg';
        }
    }
    unset($car);
    return $list;
}

function delivery_regions(): array {
    return [
        'Central Luzon' => ['Cabanatuan City'=>0, 'Nueva Ecija (other towns)'=>40, 'Tarlac'=>70, 'Pampanga'=>100, 'Bulacan'=>115, 'Aurora'=>140, 'Bataan'=>150, 'Zambales'=>200],
        'Metro Manila & nearby' => ['Metro Manila'=>135, 'Rizal'=>150, 'Cavite'=>175, 'Laguna'=>195, 'Batangas'=>235, 'Quezon (Lucena area)'=>285],
        'Ilocos & Cordillera' => ['Pangasinan'=>130, 'Benguet (Baguio)'=>170, 'La Union'=>190, 'Ifugao'=>260, 'Mountain Province'=>330, 'Ilocos Sur'=>350, 'Abra'=>380, 'Kalinga'=>420, 'Ilocos Norte'=>440, 'Apayao'=>520],
        'Cagayan Valley' => ['Nueva Vizcaya'=>150, 'Quirino'=>190, 'Isabela'=>270, 'Cagayan'=>370],
        'Bicol' => ['Camarines Norte'=>430, 'Camarines Sur'=>490, 'Albay'=>560, 'Sorsogon'=>620],
    ];
}
function delivery_fee_for_km(int $km): int {
    return (int)(round((DELIVERY_BASE + DELIVERY_PER_KM * $km) / 50) * 50);
}
function delivery_fee(string $area): ?int {
    foreach (delivery_regions() as $areas) {
        if (isset($areas[$area])) return delivery_fee_for_km($areas[$area]);
    }
    return null;
}
function delivery_regions_public(): array {
    $out = [];
    foreach (delivery_regions() as $region => $areas) {
        foreach ($areas as $name => $km) $out[$region][] = ['n'=>$name, 'km'=>$km, 'fee'=>delivery_fee_for_km($km)];
    }
    return $out;
}

function start_session(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;
    ini_set('session.gc_maxlifetime', (string)(30 * 86400));
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'httponly' => true,
        'samesite' => 'Lax',
        'secure'   => !empty($_SERVER['HTTPS']),
    ]);
    session_start();
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(16));
}

function db(): PDO {
    static $pdo = null;
    if ($pdo) return $pdo;

    if (!extension_loaded('pdo_mysql')) {
        throw new RuntimeException('PHP extension pdo_mysql is not enabled. In php.ini remove the ; before extension=pdo_mysql, then restart Apache.');
    }
    $opts = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    $base = 'mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';charset=utf8mb4';

    try {
        try {
            $pdo = new PDO($base . ';dbname=' . DB_NAME, DB_USER, DB_PASS, $opts);
        } catch (PDOException $e) {
            $code = (int)($e->errorInfo[1] ?? $e->getCode());
            if ($code !== 1049) throw $e;
            $tmp = new PDO($base, DB_USER, DB_PASS, $opts);
            $tmp->exec('CREATE DATABASE IF NOT EXISTS `' . DB_NAME . '` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
            $pdo = new PDO($base . ';dbname=' . DB_NAME, DB_USER, DB_PASS, $opts);
        }
    } catch (PDOException $e) {
        $code = (int)($e->errorInfo[1] ?? $e->getCode());
        if ($code === 2002 || $code === 2006) {
            throw new RuntimeException('Cannot connect to MySQL. Open the XAMPP Control Panel and click Start next to MySQL.');
        }
        if ($code === 1045) {
            throw new RuntimeException('MySQL refused the username/password. Check DB_USER and DB_PASS in config.php.');
        }
        throw $e;
    }

    if (!$pdo->query("SHOW TABLES LIKE 'bookings'")->fetch()) {
        $pdo->exec("CREATE TABLE IF NOT EXISTS users (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            first_name VARCHAR(60) NOT NULL,
            last_name VARCHAR(60) NOT NULL,
            mobile VARCHAR(20) NOT NULL,
            email VARCHAR(120) NOT NULL UNIQUE,
            pass_hash VARCHAR(255) NOT NULL,
            created_at VARCHAR(24) NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
        $pdo->exec("CREATE TABLE IF NOT EXISTS bookings (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id INT UNSIGNED NOT NULL,
            car_id INT NOT NULL,
            car_name VARCHAR(100) NOT NULL,
            img VARCHAR(255) NOT NULL,
            price INT NOT NULL,
            color_name VARCHAR(60) NOT NULL,
            color_hex VARCHAR(10) NOT NULL,
            days INT NOT NULL,
            qty INT NOT NULL,
            base INT NOT NULL,
            fee INT NOT NULL,
            total INT NOT NULL,
            mode VARCHAR(10) NOT NULL,
            location VARCHAR(120) NOT NULL,
            address VARCHAR(200) NOT NULL DEFAULT '',
            renter VARCHAR(100) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            pick_date VARCHAR(10) NOT NULL,
            ret_date VARCHAR(10) NOT NULL,
            status VARCHAR(12) NOT NULL DEFAULT 'active',
            created_at VARCHAR(24) NOT NULL,
            cancelled_at VARCHAR(24) NULL,
            INDEX idx_user (user_id),
            CONSTRAINT fk_booking_user FOREIGN KEY (user_id) REFERENCES users(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    }
    if (!$pdo->query("SHOW COLUMNS FROM users LIKE 'role'")->fetch()) {
        $pdo->exec("ALTER TABLE users ADD COLUMN role VARCHAR(10) NOT NULL DEFAULT 'user'");
    }
    return $pdo;
}

function current_user(): ?array {
    if (empty($_SESSION['uid'])) return null;
    $st = db()->prepare('SELECT id, first_name AS first, last_name AS last, mobile, email, role FROM users WHERE id = ?');
    $st->execute([$_SESSION['uid']]);
    $u = $st->fetch();
    return $u ?: null;
}

function public_user(?array $u): ?array {
    return $u ? ['first'=>$u['first'], 'last'=>$u['last'], 'mobile'=>$u['mobile'], 'email'=>$u['email'], 'admin'=>(($u['role'] ?? 'user') === 'admin')] : null;
}

function format_booking(array $r): array {
    return [
        'id'       => (int)$r['id'],
        'car'      => $r['car_name'],
        'img'      => $r['img'],
        'price'    => (int)$r['price'],
        'color'    => ['n'=>$r['color_name'], 'h'=>$r['color_hex']],
        'days'     => (int)$r['days'],
        'qty'      => (int)$r['qty'],
        'base'     => (int)$r['base'],
        'fee'      => (int)$r['fee'],
        'total'    => (int)$r['total'],
        'mode'     => $r['mode'],
        'location' => $r['location'],
        'address'  => $r['address'],
        'renter'   => $r['renter'],
        'phone'    => $r['phone'],
        'pickDate' => $r['pick_date'],
        'retDate'  => $r['ret_date'],
        'status'   => $r['status'],
        'date'     => $r['created_at'],
    ];
}
