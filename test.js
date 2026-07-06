const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const dom = new JSDOM(<!DOCTYPE html><div id="staff-list"></div>);
const document = dom.window.document;

function sanitizeHTML(str) {
  if (!str) return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '/': '&#x2F;' };
  return String(str).replace(/[&<>"'/]/ig, (match)=>(map[match]));
}

const s = { name: "Ram Bahadur Shrestha", role: "Teacher", subject: "Math", order: 1, photoUrl: "" };
const id = "abc";

try {
    const card = document.createElement('div'); card.className = 'item-card';
    card.innerHTML = 
         + (s.photoUrl ? <img src=" + sanitizeHTML(s.photoUrl) + " class="item-thumb"> : <div class="item-thumb-placeholder">??</div>) + 
        <div class="item-info"><h4> + sanitizeHTML(s.name) + </h4><p> - </p></div>
                <div class="item-actions">
          <button class="btn btn-outline btn-sm" onclick="editStaff('+id+', '+sanitizeHTML(s.name).replace(/'/g, "\\'")+', '+sanitizeHTML(s.role||'').replace(/'/g, "\\'")+', '+sanitizeHTML(s.subject||'').replace(/'/g, "\\'")+', +(s.order||99)+, '+(s.photoUrl||'')+')" style="color:var(--gold);border-color:var(--gold);">?</button>
          <button class="btn btn-danger btn-sm" onclick="deleteStaff('+id+','+(s.photoUrl||'')+')">??</button>
        </div>;
    
    document.getElementById('staff-list').appendChild(card);
    console.log("Success:", document.getElementById('staff-list').innerHTML);
} catch (e) {
    console.error("Error:", e);
}