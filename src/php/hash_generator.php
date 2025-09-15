
<?php
$new_password = 'AdminNew123!'; // <-- Put your new desired password here
$hashed_password = password_hash($new_password, PASSWORD_DEFAULT);
echo "Your new password is: " . $new_password . "<br>";
echo "Your new hash is: " . $hashed_password;
?>