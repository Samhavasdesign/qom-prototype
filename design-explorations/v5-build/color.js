<script>
/* "Navy buttons and greys" switch (Nov 25): on by default (Sam, Nov 25), remembered in the browser */
(function(){
  let on=true; try{ on=localStorage.getItem("qom-v5-warm")!=="off"; }catch(e){}
  document.documentElement.classList.toggle("warm",on);
  const sw=document.getElementById("warmOn"); if(!sw) return;
  sw.checked=on;
  sw.addEventListener("change",()=>{ on=sw.checked; try{ localStorage.setItem("qom-v5-warm",on?"on":"off"); }catch(e){} document.documentElement.classList.toggle("warm",on); });
})();
</script>
