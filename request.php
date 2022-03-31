<?php
header('Content-type: text/xml');
?>
<Response>
    <Dial callerId="+15185203741"><?php  echo $_POST['To'];?></Dial>
</Response>