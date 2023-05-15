async function getWeatherData(city) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY_OPENWEATHERMAP}&units=metric`;
    const response = await axios.get(url);

    if (response.status !== 200) {
      throw new Error('Errore nella richiesta dei dati meteo.');
    }

    const weatherData = response.data;

    if (!weatherData.main || !weatherData.main.temp || !weatherData.main.humidity || !weatherData.visibility) {
      throw new Error('Dati meteo incompleti o non validi.');
    }

    return weatherData;
  } catch (error) {
    throw new Error(`Errore durante la richiesta dei dati meteo per ${city}: ${error.message}`);
  }
}

async function getYelpData(city) {
  try {
    const url = `https://api.yelp.com/v3/businesses/search?location=${city}`;
    const headers = {
      Authorization: `Bearer ${API_KEY_YELP}`,
    };
    const response = await axios.get(url, { headers });

    if (response.status !== 200) {
      throw new Error('Errore nella richiesta dei dati di Yelp.');
    }

    const yelpData = response.data;

    if (!yelpData.businesses || !Array.isArray(yelpData.businesses)) {
      throw new Error('Dati di Yelp incompleti o non validi.');
    }

    return yelpData;
  } catch (error) {
    throw new Error(`Errore durante la richiesta dei dati di Yelp per ${city}: ${error.message}`);
  }
}

const express = require('express');
const axios = require('axios');

const app = express();
const API_KEY_OPENWEATHERMAP = '5ace4188674ea9f4e9bc38a7232e83f6';
const API_KEY_YELP = 'hh2YGYm7INoClCuUc_ZrxDjGPTmecyrYieBsKoHFPZNWwOr3o3EOr3JLPEyewtF_WoQXv9iKqpVMX2IXIsekq8d05JmpQAj5UkHPlp6e2HrMBARIC1qcpzX0RCBdZHYx';
const cities = ['Torino', 'Roma', 'Milano', 'Napoli', 'Bologna'];

app.get('/data', async (req, res) => {
  try {
    const compositeData = [];

    for (const city of cities) {
      // Ottieni i dati meteo per la città corrente
      const weatherData = await getWeatherData(city);

      // Ottieni i dati di Yelp per la città corrente
      const yelpData = await getYelpData(city);

      // Costruisci l'oggetto dei dati compositi per la città corrente
      const cityData = {
        city: city,
        temperature: weatherData.main.temp,
        humidity: weatherData.main.humidity,
        visibility: weatherData.visibility,
        businesses: yelpData.businesses.map((business) => ({
          name: business.name,
          rating: business.rating,
          address: business.location.display_address.join(', '),
          phone: business.phone,
        })),
      };

      // Aggiungi i dati compositi all'array
      compositeData.push(cityData);
    }

    // Restituisci i dati compositi come JSON nella risposta
    res.json(compositeData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore durante la richiesta dei dati compositi.' });
  }
});

// Funzione per ottenere i dati meteo da OpenWeatherMap
async function getWeatherData(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY_OPENWEATHERMAP}&units=metric`;
  const response = await axios.get(url);
  return response.data;
}

// Funzione per ottenere i dati di Yelp Fusion
async function getYelpData(city) {
  const url = `https://api.yelp.com/v3/businesses/search?location=${city}`;
  const headers = {
    Authorization: `Bearer ${API_KEY_YELP}`,
  };
  const response = await axios.get(url, { headers });
  return response.data;
}

// Avvia il server in ascolto sulla porta 3000
app.listen(3000, () => {
  console.log('Server in ascolto sulla porta 3000');
});
