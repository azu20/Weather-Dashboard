const apiKey = "6fed592f4d017f9018485c920aed9ba1";
$(document).ready(function () {

    function getCityHistory() {
        var history = JSON.parse(localStorage.getItem("citySearchHistory"))
        if (history === null) {
            history = [];
        }
        return history;
    }
    var citySearchHistory = getCityHistory();
    for (var i = 0; i < citySearchHistory.length; i++) {
        generateCityBtn(citySearchHistory[i]);
    }
    var currentDayNow;
    setInterval(() => {
        currentDayNow = moment().format("MMMM Do YYYY");
    }, 1000)

    function openWeatherMapCall(cityNameInput) {
        var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityNameInput + "&units=imperial&appid=" + apiKey;
        return $.ajax({
            url: queryURL,
            method: "GET",
        }).then(function (response) {
            console.log(response);
            return response;
        }).then(mainDisplay);
    }
    function mainDisplay(response) {
        var apiCity= response.name;
        var apiCountry = response.sys.country
        var temp = response.main.temp;
        var humidity = response.main.humidity;
        var windSpeed = response.wind.speed

        var longitude = response.coord.lat;;
        var latitude = response.coord.lon
        var getIcon = "https://openweathermap.org/img/wn/" + response.weather[0].icon + "@2x.png"
        let icon = $("<img>").attr("src", getIcon);

  
        $("#cityName").text(apiCity + " , " + apiCountry + ". ").append(icon); 
        $("#currentDate").text(currentDayNow);
        $("#temperature").text("Temperature(F): " + temp);
        $("#humidity").text("Humidity: " + humidity + " %");
        $("#windSpeed").text("Wind Speend: " + windSpeed + " MPH");
        uvIndexRender(latitude, longitude)
    }
    function uvIndexRender(latitude, longitude) {
        let uvqueryURL = "https://api.openweathermap.org/data/2.5/uvi?appid=" + apiKey + "&lat=" + longitude + "&lon=" + latitude
        $.ajax({
            url: uvqueryURL,
            method: "GET"
        }).then(function (response) {
            $("#uvIndex").text("UV Index: " + response.value)
            if (response.value < 3) {
                $("#uvIndex").removeClass().addClass("badge badge-success");
            } else if (response.value > 2 && response.value < 8) {
                $("#uvIndex").removeClass().addClass("badge badge-warning")
            } else {
                $("#uvIndex").removeClass().addClass("badge badge-danger")
            }
        });

    }
    function forecastData(cityNameInput) {
        var forcastQueryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + cityNameInput + "&units=imperial&appid=" + apiKey
        return $.ajax({
            url: forcastQueryURL,
            method: "GET",
        }).then(forecastDisplay)
        
    }
    function forecastDisplay(forecastResponse){
        for (var i = 0; i < forecastResponse.list.length; i++) {
                var response = forecastResponse.list[i];
                var forecast = new Date(response.dt_txt);

                if (forecast.getHours() === 12) {
                    var forecastDay = $("<div>").text(response.dt_txt);
                    var getForecastIcon = "https://openweathermap.org/img/wn/" + response.weather[0].icon + "@2x.png"
                    var forecastIcon = $("<img>").attr("src", getForecastIcon);

                    var forceastDayTemp = $("<div>").text("Temp(F): " + response.main.temp);

                    var forecaseDayHumidity = $("<div>").text("Humidity: " + response.main.humidity + "%");

                    $(".forecastDisplayBox").append($("<div>").addClass(" col-2 col-md-2 col-lg-2 border border-primary m-2").append(forecastDay, forecastIcon, forceastDayTemp, forecaseDayHumidity))
                }
            }
    }
    function storeCities() {
        var cityName = $("#inputCityName").val().trim().toLowerCase();
        citySearchHistory.push(cityName.toString())
        citySearchHistory = citySearchHistory.slice(-5);
        console.log(citySearchHistory);

        localStorage.setItem("citySearchHistory", JSON.stringify(citySearchHistory))
    }

    function generateCityBtn(cityNameInput) {
        var citySearchbutton = $("<button>");
        citySearchbutton.attr("data-name", cityNameInput);
        citySearchbutton.addClass("btn btn-info m-1")
        citySearchbutton.text(cityNameInput);
        citySearchbutton.on("click", function () {
            $(".forecastDisplayBox").html("");
            openWeatherMapCall(cityNameInput);
            forecastData(cityNameInput);
        })
        $("#citySearchList").prepend(citySearchbutton);
    }
    $("#searchbutton").on("click", function () {
        $(".forecastDisplayBox").html("");
        $(".mainDisplay").show();
        $("#forecastHeader").show();
        $(".forecastBox").show();
        var cityNameInput = $("#inputCityName").val().trim().toLowerCase();
        if (cityNameInput == "") {
            alert("Field cannot be empty")
            return;
        } else {
            openWeatherMapCall(cityNameInput);
            forecastData(cityNameInput);
        }
        storeCities();
        if (citySearchHistory.length <5) {
            generateCityBtn(cityNameInput);
        }
        else {
            $("#citySearchList button").last().remove();
            generateCityBtn(cityNameInput)
        }
        $("#inputCityName").val("");

    })
    $("#clearButton").on("click", function () {
        $(".mainDisplay").hide();
        $("#forecastHeader").hide();
        $(".forecastBox").hide();
        $("#citySearchList").empty();
        localStorage.clear();
    })
});