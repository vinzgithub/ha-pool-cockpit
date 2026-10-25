    this.shadowRoot.querySelectorAll("[data-weather-alert-focus]").forEach(control=>control.addEventListener("click",()=>{
      // Navigate first: the V3 information card exists only in Advice on some tabs.
      if(this._v4Ui?.ongletActif!=="advice")this.v4NaviguerVers("advice");
      if(this.rc271IsCollapsed("information")){
        this.rc271SetCollapsed("information",false);
        this.render();
      }
      const card=this.shadowRoot.querySelector('.v4-legacy-stage[data-v4-legacy-view="advice"] #rc26-weather-card')||this.shadowRoot.querySelector("#rc26-weather-card");
      const details=card?.querySelector("[data-weather-alert-details]");
      if(details)details.open=true;
      card?.scrollIntoView?.({behavior:this._preferences.animations?"smooth":"auto",block:"center"});
      card?.classList.add("rc26-weather-highlight");
      if(card)setTimeout(()=>card.classList.remove("rc26-weather-highlight"),1800);
    }));
