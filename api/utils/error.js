/*
The errorHandler function is to ensure consistency in the structure of error objects throughout the application. By using this utility function to create error objects, developers can ensure that all errors adhere to the same structure, which typically includes statusCode and message properties.

So instead of creating error objects manually, developers can use the errorHandler function to create error objects with the same structure. This ensures that all errors adhere to the same structure.

Therefore, the errors handled by the error-handling middleware will have the same structure, making it easier to handle and display errors to the user.
*/

export const errorHandler = (statusCode, message) => {
  const error = new Error();
  error.statusCode = statusCode;
  error. message = message;
  return error;
}
