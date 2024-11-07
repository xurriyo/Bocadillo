<?php
	
	/**
	* PDO Singleton Class v.1.0
	*
	* @author Ademílson F. Tonato
	* @link https://twitter.com/ftonato
	*
	*/
	class DB {

		protected static $instance;

		protected function __construct() {}

		public static function getInstance() {

			if(empty(self::$instance)) {

				$host="localhost";
				$dbname="bocadillo";
				$user="root";
				$password="";


				try {
					self::$instance = new PDO("mysql:host=".$host['localhost'].$db_info['db_port'].';dbname='.$dbname['bocadillo'], $user['root'], $password['']);
					self::$instance->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_SILENT);  
					self::$instance->query('SET NAMES utf8');
					self::$instance->query('SET CHARACTER SET utf8');

				} catch(PDOException $error) {
					echo $error->getMessage();
				}

			}

			return self::$instance;
		}

		public static function setCharsetEncoding() {
			if (self::$instance == null) {
				self::connect();
			}

			self::$instance->exec(
				"SET NAMES 'utf8';
				SET character_set_connection=utf8;
				SET character_set_client=utf8;
				SET character_set_results=utf8");
		}
	}

?>