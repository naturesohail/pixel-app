
export const Spinner = () => {
    return (
        // <div className="flex items-center justify-center">
        //     <div className="h-10 w-10 border-4 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
        // </div>
        <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden"></span>
      </div>
    </div>
    )
}
