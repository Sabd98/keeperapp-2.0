import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Plus, Trash2 } from "lucide-react";
import {
  Button,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  createChecklist,
  deleteChecklist,
  fetchChecklists,
} from "../store/features/checklistSlice";
import { fetchChecklistItems, initializeItemsForChecklist } from "../store/features/checklistItemSlice";


export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // State untuk checklist
  const { items: checklists, status } = useSelector(
    (state) => state.checklists
  );

  // State untuk items
  const checklistItems = useSelector(
    (state) => state.checklistItems.itemsByChecklistId || {}
  );

  // State untuk loading items
  const loadingItems = useSelector(
    (state) => state.checklistItems.loadingItems || {}
  );

  // Ambil token untuk validasi
  const token = useSelector((state) => state.auth.token);

  // Fetch checklists saat pertama load
  useEffect(() => {
    if (token) {
      dispatch(fetchChecklists());
    }
  }, [dispatch, token]);

  // Fetch items untuk setiap checklist yang belum di-load
  useEffect(() => {
    if (checklists && checklists.length > 0) {
      checklists.forEach((checklist) => {
        // Hanya fetch jika belum ada di state
        if (!checklistItems[checklist.id] && !loadingItems[checklist.id]) {
          dispatch(fetchChecklistItems(checklist.id));
        }
      });
    }
  }, [checklists, dispatch, checklistItems, loadingItems]);

  const handleCreate = () => {
    const name = prompt("Enter checklist name:");
    if (name) {
      dispatch(createChecklist({ name }))
        .unwrap()
        .then((newChecklist) => {
          // Inisialisasi state untuk checklist baru
          dispatch(initializeItemsForChecklist(newChecklist.id));
          // Refresh data setelah berhasil membuat
          dispatch(fetchChecklists());
        })
        .catch((error) => {
          console.error("Create failed:", error);
          alert("Failed to create checklist");
        });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this checklist?")) {
      dispatch(deleteChecklist(id));
    }
  };

  // Fungsi untuk mendapatkan 2 item pertama dari checklist
  const getFirstTwoItems = (checklistId) => {
    const items = checklistItems[checklistId] || [];
    return items.slice(0, 2);
  };

  return (
    <div >
      <div className="flex justify-between items-center mb-6 ">
        <h2 className="text-xl font-semibold">My Checklists</h2>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={handleCreate}
        >
          New Checklist
        </Button>
      </div>

      {status === "loading" ? (
        <div className="flex justify-center my-8">
          <CircularProgress />
        </div>
      ) : checklists.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No checklists found. Create your first checklist.
        </div>
      ) : (
        <Grid container spacing={3} >
          {checklists.map((checklist) => {
            const items = getFirstTwoItems(checklist.id);
            const itemCount = checklistItems[checklist.id]?.length || 0;
            const isLoading = loadingItems[checklist.id] === true;

            return (
              <Grid item xs={12} sm={6} md={4} key={checklist.id}>
                <Card className="h-full flex flex-col ">
                  <CardContent className="flex-grow bg-slate-300">
                    <div className="flex justify-between items-start">
                      <h3
                        className="text-lg font-medium cursor-pointer hover:underline"
                        onClick={() => navigate(`/checklist/${checklist.id}`)}
                      >
                        {checklist.name}
                      </h3>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(checklist.id)}
                      >
                        <Trash2 size={18} className="text-red-500" />
                      </IconButton>
                    </div>

                    {/* Daftar item */}
                    <div className="mt-3">
                      {isLoading ? (
                        <div className="flex justify-center py-2">
                          <CircularProgress size={20} />
                        </div>
                      ) : items.length > 0 ? (
                        <List dense className="py-0 ">
                          {items.map((item) => (
                            <ListItem key={item.id} className="py-0 px-0 ">
                              <ListItemIcon className="min-w-0 mr-2">
                                {item.status ? (
                                  <Check className="text-green-500" size={18} />
                                ) : (
                                  <div className="w-4 h-4 border border-gray-400 rounded" />
                                )}
                              </ListItemIcon>
                              <ListItemText
                                primary={item.name}
                                className={
                                  item.status
                                    ? "line-through text-gray-500"
                                    : ""
                                }
                              />
                            </ListItem>
                          ))}
                          {itemCount > 2 && (
                            <ListItem className="py-0 px-0 text-gray-500">
                              <ListItemText
                                primary={`+${itemCount - 2} more...`}
                              />
                            </ListItem>
                          )}
                        </List>
                      ) : (
                        <div className="text-gray-500 text-sm py-2">
                          No items yet
                        </div>
                      )}
                    </div>
                  </CardContent>

                  <div className="p-4 bg-slate-300">
                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      onClick={() => navigate(`/checklist/${checklist.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </div>
  );
}
