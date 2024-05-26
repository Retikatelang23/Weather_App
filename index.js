const userTab = document.querySelector("[data-userWeather]")
const searchTab = document.querySelector("[data-searchWeather]")
const userContainer = document.querySelector(".weather-container")

const grantAccessContainer = document.querySelector(".grant-location-container")
const searchForm = document.querySelector("[data-searchForm]")
const loadingScreen = document.querySelector(".loading-container")
const userInfoContainer = document.querySelector(".user-info-container")

let oldTab = userTab
const API_KEY = "22ebb581e744cd5bf37fbffa536908e2"
oldTab.classList.add("current-tab")
getfromSessionStorage()

//to switch the backgoround between tabs after clicking
function switchTab(newTab){
    if(newTab != oldTab){
        oldTab.classList.remove("current-tab")
        oldTab = newTab
        oldTab.classList.add("current-tab")
        
        if(!searchForm.classList.contains("active")){
            //kya search form vala contianer is invisible, if yess then make it visible
            userInfoContainer.classList.remove("active")
            grantAccessContainer.classList.remove("active")
            searchForm.classList.add("active")
        }
        else{
            //mai pehele search tab par thi, aab your weather tab visible karna hai
            searchForm.classList.remove("active")
            userInfoContainer.classList.remove("active")  
            // as mai your weather tab mai aa gai hu to weather bhi display karna padega, so let's check local storage first 
            // for coordinates, if we have saved them there  
            getfromSessionStorage()
        }
    }
}


userTab.addEventListener("click", () => {
    //pass clicked tab as input parameter
    switchTab(userTab)
})

searchTab.addEventListener("click", () => {
    //pass clicked tab as input parameter
    switchTab(searchTab)
})

//check if coordinates are already present n session storage
function getfromSessionStorage(){
    const localCoordinates = sessionStorage.getItem("user-coordinates")
    if(!localCoordinates){
        //agar local coordinates nahi mile
        grantAccessContainer.classList.add("active")
    }
    else{
        const coordinates = JSON.parse(localCoordinates)
        fetchUserWeatherInfo(coordinates)
    }
}

//api call
async function fetchUserWeatherInfo(coordinates){
    const {lat, lon} = coordinates
    //make grandContainer invisible
    grantAccessContainer.classList.remove("active")
    //make loader visible
    loadingScreen.classList.add("active")

    //api call
    try{
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`)
        const data = await response.json();
        
        loadingScreen.classList.remove("active")
        userInfoContainer.classList.add("active") 

        renderWeatherInfo(data)
    }
    catch(err){
        loadingScreen.classList.remove("active")
    }
}

function renderWeatherInfo(weatherInfo){
    //firsly we have to fetch the elements

    const cityName = document.querySelector("[data-cityName]")
    const countryIcon = document.querySelector("[data-countryIcon]")
    const desc = document.querySelector("[data-weatherDesc]")
    const weatherIcon = document.querySelector("[data-weatherIcon]")
    const temp = document.querySelector("[data-temp]")
    const windspeed = document.querySelector("[data-windspeed]")
    const humidity = document.querySelector("[data-humidity]")
    const cloudiness = document.querySelector("[data-cloudiness]")

    //fetch values from weatherInfo object and put it UI element 
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/40x30/${weatherInfo?.sys?.country.toLowerCase()}.png`
    desc.innerText = weatherInfo?.weather?.[0]?.description
    weatherIcon.src = `https://openweathermap.org/img/wn/${weatherInfo?.weather?.[0]?.icon}.png`
    temp.innerText = `${weatherInfo?.main?.temp} °C`
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`
    humidity.innerText = `${weatherInfo?.main?.humidity}%`
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`

}

function getLocation(){
    // if support is available
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition)
    }
    //if support available nahi hai to
    else{
        //alert("geolocation not found")
    }
}

function showPosition(position){
    
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates))
    fetchUserWeatherInfo(userCoordinates)
}

const grantAccessButton = document.querySelector("[data-grantAccess]")
grantAccessButton.addEventListener("click", getLocation())

let searchInput = document.querySelector("[data-searchInput]")
searchForm.addEventListener("submit", (e) => {

    // jo bhi default action lagi hui hai usko remove kar do
    e.preventDefault()
    let cityName =  searchInput.value;
    if(cityName === "" ){
        return;
    }
    else{
        fetchSearchWeatherInfo(cityName)
    }
})

async function fetchSearchWeatherInfo(city){
    loadingScreen.classList.add("active")
    userInfoContainer.classList.remove("active")
    grantAccessContainer.classList.remove("active")

    try{
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        )
        const data = await response.json()
        loadingScreen.classList.remove("active")
        userInfoContainer.classList.add("active")
        renderWeatherInfo(data)
    }
    catch(err){
        //pending
    }
}