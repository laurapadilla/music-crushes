import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Home() {
  const CLIENT_ID = "ad2c7654ff92405c949de032535da426";
  const REDIRECT_URI = "http://localhost:3000";
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";
  const scope = "user-top-read";

  const [token, setToken] = useState("");
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem("token");

    if (!token && hash) {
      token = hash
        .substring(1)
        .split("&")
        .find((elem) => elem.startsWith("access_token"))
        .split("=")[1];

      window.location.hash = "";
      window.localStorage.setItem("token", token);
    }

    setToken(token);

    if (token) {
      fetch(
        "https://api.spotify.com/v1/me/top/tracks?time_range=medium_term&limit=50&offset=0",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          const { items } = data;
          const tracks = items.map((track) => ({
            id: track.id,
            album: track.album.name,
            albumImg: track.album.images[0],
            artist: track.artists.map((_artist) => _artist.name).join(", "),
            songUrl: track.external_urls.spotify,
            title: track.name,
          }));
          setTracks(tracks);
          console.log(tracks);
        });
    }
  }, []);

  const logout = () => {
    setToken("");
    window.localStorage.removeItem("token");
  };

  // const getTracks = async (e) => {
  //   e.preventDefault();
  //   const { data } = await axios.get(
  //     "https://api.spotify.com/v1/me/top/tracks?time_range=medium_term&limit=50&offset=0",
  //     {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     }
  //   );
  //   console.log("hey", data);
  //   setTracks(data.items);
  // };

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {!token ? (
          <a
            href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${scope}`}
          >
            Login with spotify
          </a>
        ) : (
          <button onClick={logout}>logout</button>
        )}

        {token ? (
          <section>
            {tracks.map((track) => {
              const { id, songUrl, artist, album, albumImg, title } = track;
              return (
                <>
                  <article key={id}>
                    <h1>{title}</h1>
                    <p>{artist}</p>
                    <a href={songUrl}>listen to me</a>
                  </article>
                </>
              );
            })}
          </section>
        ) : (
          <h2>Please login</h2>
        )}
      </main>
    </div>
  );
}
