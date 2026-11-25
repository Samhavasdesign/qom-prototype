<script>
/* "Navy frame and warm greys" switch (Nov 25): off by default, remembered in the browser */
(function(){
  let on=false; try{ on=localStorage.getItem("qom-v5-warm")==="on"; }catch(e){}
  document.documentElement.classList.toggle("warm",on);
  const sw=document.getElementById("warmOn"); if(!sw) return;
  sw.checked=on;
  sw.addEventListener("change",()=>{ on=sw.checked; try{ localStorage.setItem("qom-v5-warm",on?"on":"off"); }catch(e){} document.documentElement.classList.toggle("warm",on); });
})();
</script>
