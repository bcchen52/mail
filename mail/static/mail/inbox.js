document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', (undefined) => compose_email());
  
  //submit email
  document.querySelector('#compose-form').onsubmit = function() {
    document.querySelector('#message').innerHTML = "";
    document.querySelector('#message').style.display = 'block';
    console.log(document.querySelector('#compose-recipients').value);
    let recipients = (document.querySelector('#compose-recipients').value).split(",");
    console.log(recipients);
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: (document.querySelector('#compose-recipients').value),
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value,
      })
    })
    .then( response => response.json())
    .then( result => {
      if (result.error) {
        console.log("there is an error");
        console.log(result.error);
        document.querySelector('#message').innerHTML = result.error;
        //display error on compose page 
      } else {
        console.log(result);
        let message = `<span class="subject">${document.querySelector('#compose-subject').value}</span> has been successfully been sent to <span class="subject">${document.querySelector('#compose-recipients').value}</span>`;
        load_mailbox('sent', message);
        //display error on 
      }
    });

    return false;
  }

  // By default, load the inbox
  load_mailbox('inbox');

});

function load_mailbox(mailbox, message) {
  //if something was successfully sent/archived/unarchived, load_mailbox is called with the appropriate message
  if (message) {
    document.querySelector('#message').innerHTML = message;
    document.querySelector('#message').style.display = 'block';
  } else {
    document.querySelector('#message').style.display = 'none';
  }
  
  // Show the mailbox and hide other views
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>
  <div class="container" id="emails"></div>`;

  // Show the mail
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    console.log(emails.length);
    emails.forEach(email => {
      const e = document.createElement('div');

      //figure out if read for display color
      let status = "not_read";
      if (email.read === true) {
        status = "read";
      }

      e.setAttribute('class',`row email ${status}`);

      //figure out whose email to display
      let user = "";
      if (mailbox === 'sent') {
        user = email.recipients;
      } else {
        user = email.sender;
      }

      e.innerHTML = `
        <div class="col-3 text-truncate">
          ${user}
        </div>
        <div class="col-6 text-truncate">
          <span class='subject'>${email.subject}</span> <span class='preview'>${email.body}</span>
        </div>
        <div class="col-3 text-truncate">
          <div class="d-flex justify-content-end">
            <span class='timestamp'>${email.timestamp}</span> 
          </div>
          
        </div>
        `;

      e.onclick = () => {
        load_email(email.id, mailbox);
        console.log(`email ${email.id} clicked on`);
      }
      //make each email clickable

      console.log(email);
      document.querySelector("#emails").appendChild(e);
    });
    document.querySelector('#emails-view').style.display = 'block';
  })
}


function compose_email(id) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#message').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  if (id != undefined) {
    console.log("this is a reply");
    fetch(`/emails/${id}`) 
    .then(response => response.json())
    .then(email => {
      document.querySelector('#compose-recipients').value = email.sender;
      if (email.subject.includes("Re: ")) {
        document.querySelector('#compose-subject').value = email.subject;
      } else {
        document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
      }
      document.querySelector('#compose-body').value = `${email.body}
      \n${email.timestamp}, ${email.sender}\n---------------`;
    });
  }
  //if reply

  // Hide message
  document.querySelector('#message').style.display = 'none';

}

function load_email(id, mailbox) {

  //hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  fetch(`/emails/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      read: true
    })
  })
  //make read true

  fetch(`/emails/${id}`) 
  .then(response => response.json())
  .then(email => {
    console.log(email);

    //let buttons = "<div></div>";
    let buttons = document.createElement('div');
    if (mailbox != "sent") {
      let archive = `Archive`;
      if (email.archived === true) {
        archive = `Unarchive`;
      }

      let archive_button = document.createElement('button');
      let reply_button = document.createElement('button');

      archive_button.setAttribute('class',`btn btn-sm btn-outline-primary`);
      reply_button.setAttribute('class',`btn btn-sm btn-outline-primary`);
      reply_button.setAttribute('id', 'reply');
      archive_button.innerHTML = archive;
      reply_button.innerHTML = "Reply";
      archive_button.onclick = () => {
        archive_email(id);
      }
      reply_button.onclick = () => {
        compose_email(id);
      }
      buttons.appendChild(reply_button);
      buttons.appendChild(archive_button);
      //only show reply and archive if email was received
    }

    //if this is placed before or after the fetch, the buttons sometimes quickly pop up when they aren't supposed to 
    document.querySelector('#email-view').style.display = 'block';

    const email_view = document.querySelector('#email-heading');

    email_view.innerHTML = `
      <div class="container">
        <div class="row">
          <h3>${email.subject}</h3>
          </div>
        <div class="row">
          <div class="timestamp">${email.timestamp}</div>
        </div>
        <div class="row">
        From: ${email.sender}
        </div>
        <div class="row">
        To: ${email.recipients}
        </div>
      </div>
    `;
    email_view.appendChild(buttons);
    //add buttons as elements with .onclick and then add the body

    document.querySelector('#email-content').innerHTML = `<hr><xmp>${email.body}</xmp>`;
  })
  
}

function archive_email(id) {
  fetch(`/emails/${id}`) 
  .then(response => response.json())
  .then(email2 => {
    console.log(`email is currently ${email2.archived}`);
    fetch(`/emails/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        archived: !(email2.archived)
      })
    })
    .then( () => {
      let status = "unarchived";
      if (email2.archived === false){
        status = "archived";
      } 
      let message = `<span class="subject">${email2.subject}</span> from <span class="subject">${email2.sender}</span> has successfully been ${status}`;
      console.log(message);
      load_mailbox('inbox', message);
    });
    //we load after the PUT is done so the correct info is shown
  });
}

