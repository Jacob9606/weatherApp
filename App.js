import * as Location from "expo-location"; // Expo에서 위치 정보 관련 기능을 사용하기 위한 라이브러리 임포트
import React, { useState, useEffect } from "react"; // React와 관련된 기능을 사용하기 위한 라이브러리 임포트
import { View, Text, StyleSheet, ActivityIndicator } from "react-native"; // React Native의 View, Text, StyleSheet 등을 사용하기 위한 라이브러리 임포트
import { Fontisto } from "@expo/vector-icons"; //Expo에서 제공하는 아이콘 컴포넌트 중 Fontisto 아이콘을 사용하기 위한 라이브러리 임포트

const API_KEY = "722621707e646722e36535bff54dffed"; // OpenWeatherMap API를 사용하기 위한 API 키

// 날씨 상태에 따른 아이콘 매핑. 오른쪽이 Fonisto 사이트에 있는 아이콘 이름
const icons = {
  Clouds: "cloudy",
  Clear: "day-sunny",
  Atmosphere: "cloudy-gusts",
  Snow: "snow",
  Rain: "rains",
  Drizzle: "rain",
  Thunderstorm: "lightning",
};

export default function App() {
  const [city, setCity] = useState("Loading..."); // 도시 이름을 저장하는 상태 변수 초기화
  const [temp, setTemp] = useState(null); // 온도를 저장하는 상태 변수 초기화
  const [weatherMain, setWeatherMain] = useState(""); // 날씨 상태를 저장하는 상태 변수 초기화
  const [date, setDate] = useState(""); // 현재 날짜 정보를 저장하는 상태 변수 초기화

  useEffect(() => {
    const now = new Date(); // 현재 시간을 가져오기 위한 Date 객체 생성
    const daysOfWeek = [
      // 요일 정보를 배열에 저장
      "일요일",
      "월요일",
      "화요일",
      "수요일",
      "목요일",
      "금요일",
      "토요일",
    ];
    setDate(
      // 현재 날짜 정보 설정
      `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 ${
        daysOfWeek[now.getDay()]
      }`
    );

    getWeather(); // 날씨 정보를 가져오는 함수 호출
  }, []);

  const getWeather = async () => {
    // 날씨 정보를 가져오는 비동기 함수 정의
    const { status } = await Location.requestForegroundPermissionsAsync(); // 위치 권한 요청

    // 권한이 거부되면 "Permission not granted"를 화면에 표시
    if (status !== "granted") {
      setCity("Permission not granted");
      return;
    }

    const {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync({
      // 현재 위치의 좌표 정보 가져오기
      accuracy: Location.Accuracy.High,
    });

    const location = await Location.reverseGeocodeAsync(
      { latitude, longitude },
      { useGoogleMaps: false }
    );
    setCity(location[0].city); // 현재 위치의 도시 이름 설정. Json 보고 변수명 확인해야함.

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
    ); // OpenWeatherMap API를 사용하여 날씨 정보를 가져옴

    const json = await response.json();

    if (json && json.main && json.weather) {
      //날씨 정보가 제대로 반환되면 해당 정보를 상태 변수에 설정
      setTemp(Math.round(json.main.temp));
      setWeatherMain(json.weather[0].main);
    } else {
      setCity("Weather data not available"); // 날씨 정보를 가져오지 못하면 화면에 표시
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.cityName}>{city}</Text> //도시 이름표시
        <Text style={styles.date}>{date}</Text> // 현재 날짜 표시
      </View>
      {temp === null ? ( // 날씨 정보가 로딩 중인 동안에는 로딩 스피너 표시
        <ActivityIndicator color="white" size="large" style={styles.loading} />
      ) : (
        <View style={styles.weatherInfo}>
          <Fontisto
            name={icons[weatherMain] || "day-sunny"} // 날씨 상태에 따른 아이콘 표시
            size={100}
            color="white"
          />
          <Text style={styles.temp}>{temp}°C</Text> // 온도 표시
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // 스타일 시트 정의
  container: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    position: "absolute",
    top: 50,
    alignItems: "center",
  },
  cityName: {
    fontSize: 32,
    fontWeight: "500",
    color: "white",
  },
  date: {
    fontSize: 20,
    fontWeight: "300",
    color: "white",
    marginTop: 10,
  },
  weatherInfo: {
    alignItems: "center",
    marginTop: 20,
  },
  temp: {
    fontSize: 150,
    fontWeight: "bold",
    color: "white",
  },
  loading: {
    flex: 1,
  },
});
