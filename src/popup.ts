import { QiitaZapping } from './QiitaZapping';

function info(val) {
  const status = document.getElementById('status');
  if (typeof(val) === 'object') {
    val = JSON.stringify(val);
  }
  status.textContent = val;
  setTimeout(function () {
    status.textContent = '';
  }, 1500);
}

function save_options() {
  // @ts-ignore
  const form = <HTMLFormElement> document.forms.mainForm;
  const query = Array.from([1, 2, 3], (id: number) => {
    return {
      id: id,
      domain: form[`domain${id}`].value,
      query: form[`query${id}`].value,
      token: form[`token${id}`].value,
      isActive: form.isActive.value == id,
    };
  });

  chrome.storage.local.set({ [QiitaZapping.KEY_QUERIES]: query }, () => info('Options saved.'));
  chrome.runtime.sendMessage("refresh");
}

function restore_options() {
  chrome.storage.local.get({
    [QiitaZapping.KEY_QUERIES]: [{
      id: 1,
      domain: "qiita.com",
      query: "tag:日報",
      token: "",
      isActive: 1,
    }]
  }, function (cache: StorageCache) {
    // @ts-ignore
    const form = <HTMLFormElement> document.forms.mainForm;
    cache.searchQueries.forEach((q) => {
      form[`domain${q.id}`].value = q.domain;
      form[`query${q.id}`].value = q.query;
      form[`token${q.id}`].value = q.token;
      if (q.isActive) form.isActive.value = q.id;
    });
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);