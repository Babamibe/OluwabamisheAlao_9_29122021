/**
 * @jest-environment jsdom
 */

 import { screen, waitFor } from "@testing-library/dom"
 import BillsUI from "../views/BillsUI.js"
 import { bills } from "../fixtures/bills.js"
 import Bills from "../containers/Bills.js"
 import OldBills from "../__mocks__/bills"
 import { ROUTES_PATH, ROUTES } from "../constants/routes";
 import {store} from "../__mocks__/store"
 import Store from "../app/Store.js";
 import Router from "../app/Router.js";
 import { localStorageMock } from "../__mocks__/localStorage.js"
 import userEvent from "@testing-library/user-event";
 import axios from "axios";

jest.mock('axios')

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {

    test("Then bill icon in vertical layout should be highlighted", () => {
      const html = BillsUI({ data: []})
      document.body.innerHTML = html
      //to-do write expect expression
      axios.bills = () => ({ get: jest.fn().mockResolvedValue() });

			const user = JSON.stringify({ type: "Employee" });
			window.localStorage.setItem("user", user);

      const pathname = ROUTES_PATH["Bills"];
			Object.defineProperty(window, "location", {
				value: {
					hash: pathname
				}
			});

			document.body.innerHTML = `<div id="root"></div>`;
			Router();

			const icon = screen.getByTestId('icon-window');
			expect(icon.classList.contains("active-icon")).toBeTruthy();

    })

    test("Then mes notes de frais should be displayed", () => {
      const html = BillsUI({ data: [] });
      document.body.innerHTML = html;

      expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
    })

    test("Then the nouvelle note de frais button should be displayed", () => {
      const html = BillsUI({ data: [] });
      document.body.innerHTML = html;

      expect(screen.getByTestId("btn-new-bill")).toBeTruthy();
    })


    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })

  describe("When I click on an icon eye", () => {
    test("Then a modal should open", () => {
        Object.defineProperty(window, "localStorage", {
            value: localStorageMock,
        });
        const user = JSON.stringify({
            type: "Employee",	            
        });
        window.localStorage.setItem("user", user);

        const html = BillsUI({ data: bills });
        document.body.innerHTML = html;

        const billsClass = new Bills({
            document,
            onNavigate: () =>{},
            store: null,
            localStorage: null
        });
        $.fn.modal = jest.fn();
        const eye = screen.getAllByTestId('icon-eye')[0];
        const handleClickIconEye = jest.fn(() => {
          billsClass.handleClickIconEye});
        eye.addEventListener("click", handleClickIconEye);
        userEvent.click(eye);
        //the handleClickOnEye function should be called
        expect(handleClickIconEye).toHaveBeenCalled();
        expect($.fn.modal).toBeTruthy();
    });
  });


  describe("When I click on New bill button", () => {
    test("Then It should render NewBill page", () => {
      //log in as user 
      Object.defineProperty(window, "localStorage", {
            value: localStorageMock,
        });
        const user = JSON.stringify({
            type: "Employee",
        });
        window.localStorage.setItem("user", user);

        const html = BillsUI({ data: bills });
        document.body.innerHTML = html;

        const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname });
        };
        //init Bills 
        const store = null;
        const billsNews = new Bills({
            document,
            onNavigate,
            store,
            localStorage: window.localStorage,
        });

        const handleClickNewBill = jest.fn(billsNews.handleClickNewBill);
        const newBillButton = screen.getByTestId("btn-new-bill");
        newBillButton.addEventListener("click", handleClickNewBill);
        userEvent.click(newBillButton);
        // the function handleClickNewBill should be called
        expect(handleClickNewBill).toHaveBeenCalled();
        expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
    });
  });

  describe("When  an error is detected", () => {
    test('Then Error page should be displayed', () => {
      const html = BillsUI({
        data: [],
        loading: false,
        error: 'some error message'
      });
      document.body.innerHTML = html;
      //verify that the error message appears
      expect(screen.getAllByText('Erreur')).toBeTruthy();
    })

  });

  describe("When Bill page is loading", () => {
    test('Then Loading page should be displayed', () => {
      const html = BillsUI({
        data: [],
        loading: true
      });
      document.body.innerHTML = html;
      //verify that the loading text appears
      expect(screen.getAllByText('Loading...')).toBeTruthy();
    });
  });

  describe("When Bill's list are loaded",() =>{
    test("Then bill's data should be displayed", () => {
      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;
      const billType = screen.getAllByTestId("type");
      const billName = screen.getAllByTestId("name");
      const billDate = screen.getAllByTestId("date");
      const billAmount = screen.getAllByTestId("amount");
      const billStatus = screen.getAllByTestId("status");
      const billIcon = screen.getAllByTestId("icon-eye");

      //verify that the bill information appears
      expect(billType.length).toBeGreaterThan(0);
      expect(billName.length).toBeGreaterThan(0);
      expect(billDate.length).toBeGreaterThan(0);
      expect(billAmount.length).toBeGreaterThan(0);
      expect(billStatus.length).toBeGreaterThan(0);
      expect(billIcon.length).toBeGreaterThan(0);
    });
  })


})


// test d'integration GET

describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills page", () => {
    test("fetches bills from mock API GET", async () => {
      const oldBills = [{firebase: 'get'}]
      const resp = {data: oldBills};
      
      axios.get.mockResolvedValue(resp);
      
      return OldBills.all().then(data => expect(data).toEqual(oldBills));     
      
    });
    test("fetches bills from an API and fails with 404 message error", async () => {
     axios.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      axios.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})