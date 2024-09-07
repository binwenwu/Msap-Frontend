// public/worker.js  
  
self.onmessage = async (event) => {  
  const { command, data } = event.data;  
  if (command === 'processData') {

    // 创建Blob并发送回主线程  
    const blob = new Blob([data], { type: 'application/json' });  
    self.postMessage({ url: URL.createObjectURL(blob), ...event.data });  
  }  
};