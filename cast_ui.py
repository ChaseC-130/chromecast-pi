#!/usr/bin/env python3
import pychromecast
import time

# Change these to match your network & app
PI_URL       = "http://10.0.0.107/"      # your Pi’s IP
CAST_NAME    = "Living Room TV"            # friendly name of your Chromecast
RECEIVER_APP = "D200CBF9"   # cast dev console App ID

def main():
    # give the server a moment
    time.sleep(5)
    # discover chromecasts
    chromecasts, browser = pychromecast.get_chromecasts()
    cast = next((cc for cc in chromecasts if getattr(cc, 'friendly_name', cc.name) == CAST_NAME), None)
    cast.wait()

    # 1) launch your custom receiver
    app = cast.start_app(RECEIVER_APP)
    # 2) once the receiver is running, send the URL of your UI
    cast.socket_client.receiver_controller.launch(RECEIVER_APP)
    # Some receivers accept load of the URL via a message; if yours does:
    cast.media_controller.play_media(PI_URL, "application/html")
    cast.media_controller.block_until_active()

if __name__=="__main__":
    main()
