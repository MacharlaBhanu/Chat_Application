import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import loader from "../assets/loader.gif";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { setAvatarRoute } from "../utlis/ApiRoutes";

export default function SetAvatar() {
  const navigate = useNavigate();
  const [avatars, setAvatars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState(undefined);

  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  // RoboHash sets: set1=robots, set2=monsters, set3=robot-heads, set4=cats
  const ROBOHASH_SET = "set1";

  const fetchAvatars = async () => {
    setIsLoading(true);
    setSelectedAvatar(undefined);
    const data = [];
    for (let i = 0; i < 4; i++) {
      const seed = Math.round(Math.random() * 100000);
      const url = `https://robohash.org/${seed}?set=${ROBOHASH_SET}&size=200x200`;
      const response = await axios.get(url, { responseType: "arraybuffer" });
      const base64 = btoa(
        new Uint8Array(response.data).reduce(
          (d, byte) => d + String.fromCharCode(byte),
          ""
        )
      );
      data.push(`data:image/png;base64,${base64}`);
    }
    setAvatars(data);
    setIsLoading(false);
  };

  const setProfilePicture = async () => {
    if (selectedAvatar === undefined) {
      toast.error("Please select an avatar", toastOptions);
    } else {
      const user = JSON.parse(localStorage.getItem("chat-app-user"));
      const { data } = await axios.post(`${setAvatarRoute}/${user._id}`, {
        image: avatars[selectedAvatar],
      });

      if (data.isSet) {
        user.isAvatarImageSet = true;
        user.avatarImage = data.image;
        localStorage.setItem("chat-app-user", JSON.stringify(user));
        navigate("/");
      } else {
        toast.error("Error setting avatar. Please try again.", toastOptions);
      }
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("chat-app-user")) {
      navigate("/login");
    } else {
      fetchAvatars();
    }
  }, [navigate]);

  return (
    <>
      {isLoading ? (
        <Container>
          <img src={loader} alt="loader" className="loader" />
        </Container>
      ) : (
        <Container>
          <div className="title-container">
            <h1>Pick an Avatar as your profile picture</h1>
          </div>
          <div className="avatars">
            {avatars.map((avatar, index) => (
              <div
                className={`avatar ${selectedAvatar === index ? "selected" : ""}`}
                key={index}
                onClick={() => setSelectedAvatar(index)}
              >
                <img src={avatar} alt={`avatar-${index}`} />
                {selectedAvatar === index && (
                  <div className="check-badge">✓</div>
                )}
              </div>
            ))}
          </div>
          <div className="buttons">
            <button onClick={setProfilePicture} className="submit-btn">
              Set as Profile Picture
            </button>
            <button onClick={fetchAvatars} className="reload-btn">
              🔄 Generate New Avatars
            </button>
          </div>
          <ToastContainer />
        </Container>
      )}
    </>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 3rem;
  background-color: #131324;
  height: 100vh;
  width: 100vw;

  .loader {
    max-inline-size: 100%;
  }

  .title-container {
    h1 {
      color: white;
      font-size: 1.8rem;
    }
  }

  .avatars {
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
    justify-content: center;

    .avatar {
      position: relative;
      border: 0.35rem solid transparent;
      padding: 0.5rem;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      transition: all 0.3s ease-in-out;
      background-color: #1a1a35;

      img {
        height: 7rem;
        width: 7rem;
        border-radius: 50%;
        object-fit: cover;
        transition: transform 0.3s ease-in-out;
      }

      &:hover {
        border-color: #7c4dff;
        transform: scale(1.05);
      }

      .check-badge {
        position: absolute;
        bottom: 4px;
        right: 4px;
        background-color: #4e0eff;
        color: white;
        border-radius: 50%;
        width: 1.5rem;
        height: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
        font-weight: bold;
        border: 2px solid #131324;
      }
    }

    .selected {
      border-color: #4e0eff;
      box-shadow: 0 0 18px #4e0effaa;
    }
  }

  .buttons {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .submit-btn {
    background-color: #4e0eff;
    color: white;
    padding: 1rem 2rem;
    border: none;
    font-weight: bold;
    cursor: pointer;
    border-radius: 0.4rem;
    font-size: 1rem;
    text-transform: uppercase;
    transition: background-color 0.3s;

    &:hover {
      background-color: #3a0bcc;
    }
  }

  .reload-btn {
    background-color: transparent;
    color: #4e0eff;
    padding: 1rem 2rem;
    border: 0.2rem solid #4e0eff;
    font-weight: bold;
    cursor: pointer;
    border-radius: 0.4rem;
    font-size: 1rem;
    text-transform: uppercase;
    transition: all 0.3s;

    &:hover {
      background-color: #4e0eff;
      color: white;
    }
  }
`;