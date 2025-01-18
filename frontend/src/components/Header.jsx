import { useEffect, useState } from "react";
import axios from "axios";

export default function Header() {
    {/* SVGS */}
    const trashsvg = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
    <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
    {/* STATES */}
    const [data, setdata] = useState({ summary: "" });
    const [getdata, setgetdata] = useState([]);
    const [checked, setchecked] = useState([]);
    const [empty, setempty] = useState(true)

    {/* FUNCTIONS */}
    {/* DELETE STATE & DATA */}
    function Delete(index, object) {
        
        {/* POST DELETE DATABASE DATA */}
        const deletedata = {id : index, summary : object.summary}
        axios.post("http://127.0.0.1:5000/deletechecklistdatastate", deletedata)
        .then(() => 
            setchecked(item => item.filter(prev => String(prev.location) !== index)),
            setgetdata(item => item.filter(prev => prev.summary !== object.summary))
        )
    }
    {/* POST & GET */}
    function Submit(e) {
        if (data !== "") {

            setempty(true)
            e.preventDefault();
            axios.post("http://127.0.0.1:5000/checklistdata", data)
                .then(() => {
                    axios.get("http://127.0.0.1:5000/returnchecklistdata")
                        .then(response => {
                            setgetdata(response.data);
                        });
                });
                setdata(prev => ({...prev, summary : ""}))
            }
        else {
            setempty(true)
        }
        
    }

    {/* GET checklist data */}
    useEffect(() => {
        axios.get("http://127.0.0.1:5000/returnchecklistdata")
            .then(response => {
                setgetdata(response.data);
            });
    }, []);

    {/* GET checklist states */}
    useEffect(() => {
        axios.get("http://127.0.0.1:5000/returncheckliststates")
            .then(response => {
                const transformed = response.data.map(item => ({
                    location: String(item.location),
                    state: !!item.state,
                }));
                console.log("Fetched states:", transformed); // Debug log
                setchecked(transformed);
            });
    }, []);

    function ChangeData(e) {
        if (e.target.value !== "") {
            setempty(false)
        }
        if (e.target.value === "") {
            setempty(true)
        }
        setdata(prev => ({ ...prev, summary: e.target.value }));
    }

    function SetState(index) {
        const location = String(index); // Ensure consistent string type
        const existing = checked.find(prev => prev.location === location);
        const userdata = { location, state: !existing?.state };

        // Update the backend
        const endpoint = existing
            ? "http://127.0.0.1:5000/checkliststates"
            : "http://127.0.0.1:5000/checkliststatesadd";
        
        axios.post(endpoint, userdata).then(() => {
            // Update the state immediately for a better UX
            setchecked(prev => {
                if (existing) {
                    // Update the state of an existing item
                    return prev.map(item =>
                        item.location === location ? { ...item, state: !item.state } : item
                    );
                } else {
                    // Add a new state item
                    return [...prev, userdata];
                }
            });
        });
    }

    return (
        <>
            {/* START */}
            {/* 1ST CONTAINER */}
            <div className="flex mt-9 p-16 mb-36 justify-center items-center gap-8 flex-col">
                {/* INPUT */}
                <p className="font-medium  text-6xl">Add a Note 😁</p>
                <input placeholder="Add a Note!"
                    value={data.summary}
                    onChange={ChangeData}
                    className="w-72 border-2 font-medium placeholder:font-medium p-2 rounded-2xl border-black"
                    type="text"
                />
                <button className={`rounded-2xl outline duration-500 p-3 transition-all ${empty ? "bg-slate-400 pointer-events-none" : "bg-emerald-300"} text-white font-medium bg-emerald-300`} onClick={Submit} type="submit">
                    Submit
                </button>
                {/* Mapped Items */}
                {getdata.map((object, index) => (
                    <div key={index} className="flex gap-3 ml-96 self-start items-center">
                        <button onClick={() => Delete(index, object)} className="">
                            {trashsvg}
                        </button>
                        
                        
                        <input
                            className="w-3 h-3"
                            onChange={() => SetState(index)}
                            type="checkbox"
                            checked={checked.some(
                                prev => prev.location === String(index) && prev.state === true
                            )}
                        />
                        <p
                            className={`transition-[property] duration-300  font-medium ${
                                checked.some(
                                    prev => prev.location === String(index) && prev.state === true
                                )
                                    ? "line-through"
                                    : ""
                            }`} 
                        >
                            {object.summary}
                            
                        </p>
                    </div>
                ))}
            </div>
        </>
    );
}
