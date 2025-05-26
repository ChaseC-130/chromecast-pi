import pychromecast, time
from pychromecast.error import RequestFailed

# These three values...
PI_URL       = "http://10.0.0.107/"   # still your LAN-hosted React UI
CAST_NAME    = "Living Room TV"
RECEIVER_APP = "D200CBF9"             # your GitHub-Pages receiver App ID

def main():
    time.sleep(5)
    chromecasts, browser = pychromecast.get_chromecasts()
    print("Found devices:", chromecasts)

    cast = next(
        (cc for cc in chromecasts
         if getattr(cc, 'friendly_name', cc.name) == CAST_NAME),
        None
    )
    if not cast:
        print(f"❌ Chromecast “{CAST_NAME}” not found.")
        return

    cast.wait()
    try:
        print("▶ Launching custom receiver…")
        cast.start_app(RECEIVER_APP)
        print("✅ Receiver started; your UI iframe will load from", PI_URL)
    except RequestFailed as e:
        print("❌ Failed to launch custom receiver:", e)

if __name__ == "__main__":
    main()
