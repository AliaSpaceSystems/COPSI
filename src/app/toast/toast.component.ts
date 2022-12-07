import { Component, Injectable, OnInit } from '@angular/core';

let toastContainerDiv: any;
let toastMainDiv: any;

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
@Injectable({
  providedIn: 'root'
})
export class ToastComponent implements OnInit {

  public message: string = '';
  constructor() {
  }

  ngOnInit(): void {
    toastContainerDiv = document.getElementById('toast-container-div')!;
    toastMainDiv = document.getElementById('toast-main-div')!;
  }

  showToast(message: string) {
    this.message = message;
    toastContainerDiv.style.visibility = 'visible';
    toastContainerDiv.style.bottom = '1.75rem';
    toastContainerDiv.style.opacity = '1.0';
    document.getElementById('toast-title')!.innerHTML = this.message;
    setTimeout(function(){
      toastContainerDiv.style.opacity = '0.0';
      toastContainerDiv.style.bottom = '1.25rem';
      toastContainerDiv.style.visibility = 'hidden';
    }, 5000);
  }

  showInfoToast(type: string, message: string) {
    if (type === "success") {
      toastMainDiv.className = "success";
    } else if (type === "error") {
      toastMainDiv.className = "error";
    } else {
      toastMainDiv.className = "base";
    }

    this.showToast(message);
  }
}

