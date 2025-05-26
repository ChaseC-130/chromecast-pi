import pychromecast, time

PI_URL    = "http://10.0.0.107/"
CAST_NAME = "Living Room TV"

def main():
    time.sleep(5)
    chromecasts, browser = pychromecast.get_chromecasts()
    print(chromecasts)
    cast = next(
      (cc for cc in chromecasts
         if getattr(cc, 'friendly_name', cc.name) == CAST_NAME),
      None
    )
    if not cast:
        print(f"❌ Chromecast “{CAST_NAME}” not found.")
        return

    cast.wait()
    mc = cast.media_controller
    # Load your UI as “media” (mimeType “application/html”)
    mc.play_media(PI_URL, "application/html")
    mc.block_until_active()
    print("✅ Casting via Default Media Receiver")

if __name__ == "__main__":
    main()
