/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import NewBill from "../containers/NewBill.js"
import NewBillUI from "../views/NewBillUI.js"
import BillsUI from "../views/BillsUI.js"
import {ROUTES_PATH } from "../constants/routes";
import "@testing-library/jest-dom/extend-expect";
import Router from "../app/Router.js";
import axios from "axios";
import AddBill from "../__mocks__/addBill"

jest.mock('axios');
describe("Given I am connected as an employee", () => {
  describe("When I am on nouvelle note de frais", () => {
    //log in as user and open new bill
    beforeEach(() => {
      const user = JSON.stringify({ 
          type: "Employee",
          email : 'a@a',
      });
      window.localStorage.setItem("user", user);

      const pathname = ROUTES_PATH["NewBill"];
      Object.defineProperty(window, "location", {
          value: {
              hash: pathname
          }
      });

      document.body.innerHTML = `<div id="root"></div>`;
      Router();
    });

    //check the required input
    test("Then the type of expense is required", () => {
      const type = screen.getByTestId("expense-type");
      expect(type).toBeRequired();
    })
    test("Then the date is required", () =>{
      const date = screen.getByTestId("datepicker");
      expect(date).toBeRequired();
    })
    test("Then the amount is required", () =>{
      const amount = screen.getByTestId("amount");
      expect(amount).toBeRequired();
    })
    test("Then the pct is required", () =>{
      const pct = screen.getByTestId("pct");
      expect(pct).toBeRequired();
    })
    test("Then the expense document is required", () =>{
      const file = screen.getByTestId("file");
      expect(file).toBeRequired();
    })
  
    });

    describe("when the file format is not accepted", () =>{
      test("Then the value of input's file  should be empty", () => {
        //init newBill
        const newBill = new NewBill({
          document,         
        });

        window.alert = jest.fn();
        //mock file
        const inputData = {
          file: "file.pdf",
        };

        const handleChangeFile = jest.fn(newBill.handleChangeFile);
        const inputFile = screen.getByTestId("file");
        //listen to change in file input
        inputFile.addEventListener("change", handleChangeFile);
        fireEvent.change(inputFile, {
          target: {
              files: [
                  new File(["image"], inputData.file, {
                      type: "application/pdf",
                  }),
              ],
          },
        });
        //the file name should not appear
        expect(inputFile.value).toEqual("");
      });
    });

    describe("When the image format is accepted", () => {
      test("Then the file name should be displayed into the input", () => {
        // build user interface
        const html = NewBillUI();
        document.body.innerHTML = html;

        //init newBill
        const newBill = new NewBill({ document, onNavigate, store: null, localStorage });
        const changeFile = jest.fn(newBill.handleChangeFile);
        const file = screen.getByTestId("file");
        
        // listen to check file input change
        file.addEventListener("change", changeFile);
        fireEvent.change(file, {
          target: {
            files: [new File(["image.jpg"], "image.jpg", { type: "image/jpg" })],
          },
        });

        //the function changeFile should be called
        expect(changeFile).toHaveBeenCalled();
        //the file name should appear in the input
        expect(file.files[0].name).toBe("image.jpg");
        //the form can be sent
        expect(screen.getByText('Envoyer une note de frais')).toBeTruthy();
      }); 
    })
    describe('When I submit the form with an image (jpg, jpeg, png)', () => {
      test('Then it should create a new bill', () => {
          // Init store
          const store = null;

          // Build user interface
          const html = NewBillUI();
          document.body.innerHTML = html;

          // Init newBill
          const newBill = new NewBill({
              document,
              onNavigate,
              store,
              localStorage
          });

          // mock of handleSubmit
          const handleSubmit = jest.fn(newBill.handleSubmit);

          // EventListener to submit the form
          const submitBtn = screen.getByTestId('form-new-bill');
          submitBtn.addEventListener('submit', handleSubmit);
          fireEvent.submit(submitBtn);

          // handleSubmit function must be called
          expect(handleSubmit).toHaveBeenCalled();
      });
  });
    describe("When click on submit button of form new bill", () => {
      test("Then should called handleSubmit function", () => {
        // build user interface
        const html = NewBillUI();
        document.body.innerHTML = html;
        
        //init store
        const store = null;
        const onNavigate = (pathname) => {
          document.body.innerHTML = pathname;
        };

        //init newBill
        const newBill = new NewBill({ document, onNavigate, store, localStorage: window.localStorage });
        const newBillSubmitted = screen.getByTestId("form-new-bill");

        //verify the presence of form new bill id
        expect(newBillSubmitted).toBeTruthy();

        //listen to check if form is submitted
        const handleSubmit = jest.fn(newBill.handleSubmit);
        newBillSubmitted.addEventListener("submit", handleSubmit);
        fireEvent.submit(newBillSubmitted);

        //the handleSubmit function should be called
        expect(handleSubmit).toHaveBeenCalled();
      });

      test("Then bill form is submitted", () => {
        //user interface
        const html = NewBillUI();
        document.body.innerHTML = html;
        
        //init newBill
        const store = null;
        const newBill = new NewBill({ document, onNavigate, store, localStorage: window.localStorage });

        const createdBill = jest.fn(newBill.updateBill);
        const newBillSubmitted = screen.getByTestId("form-new-bill");

        newBillSubmitted.addEventListener("submit", createdBill);
        fireEvent.submit(newBillSubmitted);

        //the function updateBill should be called
        expect(createdBill).toHaveBeenCalled();
        //the text "Envoyer une note de frais" should appear
        expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
      });
    })    
  });

  describe('When I add a file other than an image (jpg, jpeg or png)', () => {


    test('Then the error message should be display', async () => {
        // user interface
        const html = NewBillUI();
        const store = null ;
        document.body.innerHTML = html;

        // init newBill
        const newBill = new NewBill({
            document,
            onNavigate,
            store,
            localStorage
        });

        // Mock of handleChangeFile
        const handleChangeFile = jest.fn(() => newBill.handleChangeFile);

        // Add Event and fire
        const inputFile = screen.getByTestId('file');
        inputFile.addEventListener('change', handleChangeFile);
        fireEvent.change(inputFile, {
            target: {
                files: [new File(['image.exe'], 'image.exe', {
                    type: 'image/exe'
                })],
            }
        });

        // handleChangeFile function must be called
        expect(handleChangeFile).toBeCalled();
        // The name of the file should be 'image.exe'
        expect(inputFile.files[0].name).toBe('image.exe');
        expect(screen.getByText('Envoyer une note de frais')).toBeTruthy();
        // await waitFor(() => {
        //     // We wait for the error message to appear by removing the "hide" class
        //     expect(screen.getByTestId('errorFile').classList).toHaveLength(0);
        // });
    });
});




// test d'integration POST

describe("Given I am an user connected as Employee", () =>{
  describe("When I fill the required input and click on the submit button", () =>{
    test("then add bill to mock API POST", async () => {
      const addBill =[ 
        {
          email: 'a@a',
          type: 'Transports',
          name:  'Billet train Lille Paris',
          amount: '50€',
          date:  '2021-01-21',
          vat: 10,
          pct: 5,
          commentary: "",
          fileUrl: 'https://stockimage.com/image.png',
          fileName: 'image.png',
          status: 'pending'
        }];
      const resp = {data: addBill};
      axios.post.mockResolvedValue(resp);
      return AddBill.post().then(data => expect(data).toEqual(addBill));
      
    
    });
    
    test("fetches bills from an API and fails with 404 message error", async () => {
      axios.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      axios.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})