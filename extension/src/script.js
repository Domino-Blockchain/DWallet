window.domilet = {
  postMessage: (message) => {
    const listener = (event) => {
      if (event.detail.id === message.id) {
        window.removeEventListener('domilet_contentscript_message', listener);
        window.postMessage(event.detail);
      }
    };
    window.addEventListener('domilet_contentscript_message', listener);

    window.dispatchEvent(
      new CustomEvent('domilet_injected_script_message', { detail: message }),
    );
  },
};
