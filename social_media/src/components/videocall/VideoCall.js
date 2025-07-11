import React, { useEffect } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

const VideoCall = ({ roomID, userID, userName }) => {
  const appID = 1857964758;
  const serverSecret = "be51e5ddcb62628f3a3c420d8fdfc19d";

  const myMeeting = async (element) => {
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomID,
      userID,
      userName
    );

    const zp = ZegoUIKitPrebuilt.create(kitToken);
    zp.joinRoom({
      container: element,
      sharedLinks: [
        {
          name: "Copy Link",
          url: window.location.origin + "?roomID=" + roomID,
        },
      ],
      scenario: {
        mode: ZegoUIKitPrebuilt.OneONoneCall,
      },
      showScreenSharingButton: false,
    });
  };

  useEffect(() => {
    myMeeting(document.getElementById("video-call-container"));
  }, []);

  return (
    <div>
      <div id="video-call-container" style={{ width: "100%", height: "500px" }}></div>
    </div>
  );
};

export default VideoCall;
