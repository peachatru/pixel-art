// service worker adapted from: https://tudip.com/blog-post/how-to-turn-a-website-or-web-application-into-pwa-with-example/
// we want to install and register a serviceWorker so that it can act as a middleware
// between the web application and the network!

// it'll also enable PWAs to work offline by caching important assets and data during the initial visit
if("serviceWorker" in navigator){
    navigator.serviceWorker.register("js/service_worker.js").then(registration=>{
      console.log("SW Registered!");
    }).catch(error=>{
      console.log("SW Registration Failed");
    });
}else{
  console.log("Not supported");
}