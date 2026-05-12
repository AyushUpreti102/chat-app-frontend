export const notify = async (from, msg) => {
  if ("Notification" in window) {
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      new Notification(`New Message from ${from}`, {
        body: msg,
      });
    }
  }
};
