/* Presentation, accessible interactions, and exports for the analytics demo. */
(() => {
  const {escape: esc, toast} = DemoUI;
  document.getElementById('kpi-enrollment').textContent = stats.TotalStudents.total.toLocaleString();
  document.getElementById('kpi-cleared').textContent = stats.ClearedFs.total;
  document.getElementById('kpi-risk').textContent = studentDB.filter(s => s.courses.some(c => c.grade === 'F' && c.streak >= 3)).length;
  document.getElementById('failure-track').style.width = stats.TotalFailingPct.total + '%';
  const table = document.getElementById('main-stats-table');
  table.setAttribute('aria-label', 'Student indicators by group or grade');
  const footnote = document.createElement('div'); footnote.className = 'table-footnote';
  footnote.innerHTML = '<span>Select a blue count to view matching students.</span><span>Current sample period</span>';
  table.closest('.stats-container').append(footnote);
  const originalSwitch = switchView;
  switchView = view => {
    originalSwitch(view);
    const titles = {snapshot:['See the signal. Shape the next step.','A shared view of student progress, built for meaningful follow-through.'],history:['Progress is a pattern, not a moment.','Compare weekly movement and follow the direction of student outcomes.'],intervention:['Turn a concern into a next step.','Find persistent course failures and keep your team’s follow-up in context.']};
    document.getElementById('view-title').textContent = titles[view][0];
    document.getElementById('view-description').textContent = titles[view][1];
    document.querySelectorAll('.nav-item').forEach(el => el.id === 'nav-' + view ? el.setAttribute('aria-current', 'page') : el.removeAttribute('aria-current'));
    window.scrollTo({top:0,behavior:'instant'});
    if (view === 'history') renderChartTable();
  };
  function updatePressed() {
    document.querySelectorAll('.toggle-btn,.list-tab,.history-card').forEach(el=>el.setAttribute('aria-pressed',String(el.classList.contains('active'))));
  }
  updatePressed();
  document.addEventListener('keydown', e => {
    const el=e.target.closest('.accordion-header,.history-card');
    if(el && ['Enter',' '].includes(e.key)){e.preventDefault();el.click();}
  });
  document.addEventListener('click', e => {
    const header=e.target.closest('.accordion-header');
    if(header)header.setAttribute('aria-expanded',String(header.nextElementSibling.style.display==='block'));
    if(e.target.closest('.toggle-btn,.list-tab,.history-card'))updatePressed();
  });
  // Existing overlays now trap focus, close on Escape, and return focus to the trigger.
  const activeModals=[];
  const modalObserver=new MutationObserver(records=>{
    for(const {target} of records){
      const index=activeModals.findIndex(m=>m.el===target);
      if(target.style.display==='flex'&&index<0){
        activeModals.push({el:target,opener:document.activeElement});
        const first=target.querySelector('input,textarea,button,[tabindex="0"]');first?.focus();
      }else if(target.style.display!=='flex'&&index>=0){
        const [closed]=activeModals.splice(index,1);closed.opener?.focus();
      }
    }
    document.body.style.overflow=activeModals.length?'hidden':'';
  });
  document.querySelectorAll('.modal-overlay').forEach((el,i)=>{
    el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');
    const title=el.querySelector('.modal-header h3');if(!title.id)title.id='dashboard-dialog-title-'+i;
    el.setAttribute('aria-labelledby',title.id);
    el.querySelector('.modal-close')?.setAttribute('aria-label','Close '+title.textContent.toLowerCase());
    modalObserver.observe(el,{attributes:true,attributeFilter:['style']});
  });
  document.addEventListener('keydown',e=>{
    const modal=activeModals.at(-1)?.el;if(!modal)return;
    if(e.key==='Escape'){closeModal(modal.id);e.preventDefault();return;}
    if(e.key==='Tab'){
      const focusable=[...modal.querySelectorAll('button,input,textarea,select,a[href],[tabindex="0"]')].filter(el=>!el.disabled&&el.getClientRects().length);
      const first=focusable[0],last=focusable.at(-1);
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
    }
  });
  document.getElementById('settingSchoolName').maxLength=100;
  document.getElementById('noteInput').maxLength=3000;
  // Export the visible summary with the same labels and numbers as the table.
  document.getElementById('export-summary').onclick=()=>{
    const cell=value=>'"'+String(value).replace(/^[=+@-]/,"'$&").replace(/"/g,'""')+'"';
    const rows=[['American High School — fictional demo data'],...Array.from(table.rows,row=>Array.from(row.cells,c=>c.textContent.trim()))];
    rows[0][0]=document.getElementById('schoolNameDisplay').textContent+' — fictional demo data';
    const blob=new Blob(['\uFEFF'+rows.map(r=>r.map(cell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8;'});
    const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='student-support-summary-'+currentView+'.csv';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);toast('Summary exported using the selected group or grade view.');
  };
  // Keep a text equivalent available for charts, including when the CDN is blocked.
  const trendDetails=document.createElement('details');trendDetails.className='chart-accessible';
  document.getElementById('trendChart').closest('.chart-wrapper').after(trendDetails);
  function renderChartTable(){
    const selected=document.querySelector('.history-card.active .h-card-title')?.textContent||'Total Failing';
    const key=selected==="All A's"?'AllAs':selected==="All A's & B's"?'AllAsBs':selected==='Enrollment'?'TotalStudents':'TotalFailing';
    const current=stats[key].total,values=[.95,1.02,.98,1.05,.97,1.01,.99,1].map(v=>Math.round(current*v));
    trendDetails.innerHTML='<summary>View '+esc(selected)+' chart data</summary><div class="table-responsive"><table><thead><tr>'+values.map((_,i)=>'<th>'+(i===7?'Current':'Week '+(i+1))+'</th>').join('')+'</tr></thead><tbody><tr>'+values.map(v=>'<td>'+v+'</td>').join('')+'</tr></tbody></table></div>';
  }
  document.getElementById('history-card-container').addEventListener('click',renderChartTable);
  renderChartTable();
  if(typeof Chart==='undefined'){
    document.querySelectorAll('.chart-wrapper').forEach(el=>{const message=document.createElement('p');message.className='chart-fallback';message.textContent='The chart library could not load. The current overview and intervention records are still available.';el.append(message);});
  }else{
    const details=document.createElement('details');details.className='chart-accessible';
    details.innerHTML='<summary>View movement chart data</summary><div class="table-responsive"><table><thead><tr><th>Week</th><th>New failing</th><th>Cleared failing</th></tr></thead><tbody>'+velocityChart.data.labels.map((label,i)=>'<tr><td>'+esc(label)+'</td><td>'+velocityChart.data.datasets[0].data[i]+'</td><td>'+velocityChart.data.datasets[1].data[i]+'</td></tr>').join('')+'</tbody></table></div>';
    document.getElementById('velocityChart').closest('.chart-wrapper').after(details);
  }
  const footer=document.querySelector('.footer-content');
  const contact=document.createElement('a');contact.className='footer-link';contact.style.fontSize='10px';contact.href='../contact/?interest=custom-build';contact.textContent='Bring this workflow to your school ↗';footer.append(contact);
  DemoUI.tour('gcea-dashboard-tour-v1',[
    {title:'From scattered data to a shared picture.',text:'This student support dashboard brings academic, attendance, and behavior indicators together so a school team can find the students who need a closer look.',prepare:()=>switchView('snapshot')},
    {title:'Start with the school-wide signal.',text:'These cards show the current failing-grade rate, enrollment, students back to passing, and students with sustained course failures. Every number comes from the same fictional student records.',target:'.kpi-section'},
    {title:'Go from a count to a conversation.',text:'Switch between last-name groups and grade levels. Select any blue count to see the matching students, then add a follow-up note. Notes remain available until refresh.',target:'#weekly-summary'},
    {title:'Look at the direction of travel.',text:'Trends & movement compares new failures with cleared failures and shows eight illustrative weeks. Choose a metric below the trend chart or open its text data table.',target:'.nav-tabs'},
    {title:'Make the follow-up specific.',text:'In Intervention workspace, filter by consecutive weeks, expand a student to review courses, and save a note. Settings changes the school name; Export summary downloads the group or grade table as a CSV.',target:'#intervention-prompt'},
    {title:'Close the loop with automation.',text:'The connected Apps Script project can prepare personalized emails, create teacher follow-up drafts, and notify staff from intervention forms. This preview sends no messages.',target:'#dashboard-automation',hint:'Replay this tour from Quick tour. All sample records are fictional; your changes last until refresh.'}
  ]);
})();
