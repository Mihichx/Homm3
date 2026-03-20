<?
session_start();
include __DIR__ . '\setting.php';

$dbname = 'dbname='. $dbAuth['base'] .';';
$host = 'host=localhost';
$mdh = 'mysql:' . $dbname . $host;
$user = $dbAuth['user'];
$pass = $dbAuth['password'];
$opt = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => true,
    PDO::MYSQL_ATTR_USE_BUFFERED_QUERY => true,
];

$db = null;

try {
    $db = new PDO($mdh, $user, $pass, $opt);
} catch (Exception $exception) {
    die($exception->getMessage());
}

$table = $_POST['table'];


// загрузить меню и настройки из БД
$query = "SELECT * FROM `". $table ."`";
$dbResult = $db->query($query);
echo json_encode($dbResult->fetchAll());
$dbResult->closeCursor();
?>