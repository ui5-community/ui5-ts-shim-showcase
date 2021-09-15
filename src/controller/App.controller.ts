import Button from "sap/m/Button";
import MessageBox from "sap/m/MessageBox";
import Controller from "sap/ui/core/mvc/Controller";
import AppComponent from "../Component";
import { reverse } from "lodash";

/**
 * @namespace ui5-ts-shim-showcase.controller
 */
export default class AppController extends Controller {

	public onInit() : void {
		// apply content density mode to root view
		this.getView().addStyleClass((this.getOwnerComponent() as AppComponent).getContentDensityClass());
	}

	public sayHello() : void {
		const btn = this.byId("btn") as Button;
		MessageBox.show(reverse(btn.getText().split("")).join(""), {
			title: btn.getText()
		});
	}

}