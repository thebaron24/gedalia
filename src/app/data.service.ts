import { Injectable, Inject, Optional } from '@angular/core';
import { Location, APP_BASE_HREF } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class DataService {

	config: Object;
	apidomain: String;

  constructor(private http: HttpClient) {
  	//get config
  	this.getJson("http://www.baronwilson.io/assets/config.json").subscribe(data => {
  		console.log(data);
  		this.config = data;
  		this.apidomain =  this.config['apidomain'];
  	});
  }

  getJson(url) {
  	return this.http.get(url);
	}

	getArray(url) {
  	return this.http.get<any[]>(url);
	}

	getPages() {
  	return this.getArray(this.config['apidomain'] + this.config['pages']);
	}
}
