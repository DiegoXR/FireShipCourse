<script lang="ts">
    import AuthCheck from "$lib/components/AuthCheck.svelte";
    import { db, user, userData } from "$lib/firebase";
    import { doc, getDoc, writeBatch} from "firebase/firestore";
  
    let username = "";
    let loading = false;
    let isAvailable = false;
  
    
    let debounceTimer: NodeJS.Timeout;
  


  async function checkAvailability() {
  // Set isAvailable to false initially
  isAvailable = false;

  // Clear any existing debounce timer
  clearTimeout(debounceTimer);

  // Set loading to true to indicate that the availability check is in progress
  loading = true;

  // Set a debounce timer to wait for 500 milliseconds before performing the availability check
  debounceTimer = setTimeout(async () => {
    // Log the username being checked for availability
    console.log("checking availability of", username);

    // Create a reference to the "usernames" collection in the Firestore database with the entered username
    const ref = doc(db, "usernames", username);

    // Use getDoc to asynchronously check if the document (username) exists
    const exists = await getDoc(ref).then((doc) => doc.exists());

    // Update isAvailable based on whether the username exists or not
    isAvailable = !exists;

    // Set loading to false to indicate that the availability check is complete
    loading = false;
  }, 500);
}

  
async function confirmUsername() {
  // Log the confirmation of the username
  console.log("confirming username", username);

  // Create a batch write operation for multiple document writes
  const batch = writeBatch(db);

  // Set the chosen username for the user in the "usernames" collection
  batch.set(doc(db, "usernames", username), { uid: $user?.uid });

  // Set user data in the "users" collection with the chosen username and additional information
  batch.set(doc(db, "users", $user!.uid), { 
    username, 
    photoURL: $user?.photoURL ?? null,
    published: true,
    bio: 'I am the Walrus',
    links: [
      {
        title: 'Test Link',
        url: 'https://kung.foo',
        icon: 'custom'
      }
    ]
  });

  // Commit the batch write operation to Firestore
  await batch.commit();

  // Reset the username input and availability status
  username = '';
  isAvailable = false;
}

 // Declaring reactive values for Username validation

const re = /^(?=[a-zA-Z0-9._]{3,16}$)(?!.*[_.]{2})[^_.].*[^_.]$/;
  
    /* $: isValid = username?.length > 2 && username.length < 16 && re.test(username);
    $: isTouched = username.length > 0;
    $: isTaken = isValid && !isAvailable && !loading */

    $: isValid = true;
    $: isTouched = username.length > 0;
    $: isTaken = true;

  
  </script>
  
  
 <!--  Use Authcheck compoment to determine if the user has been logged in.
  He will only see the username section if it hass logged in. -->

  <AuthCheck>
    
    {#if $userData?.username}
    <p class="text-secondary" >Your username is <span class="text-secondary">@{$userData.username}</span></p>
    <p class="text-secondary" >(Usernames cannot be changed)</p>
    <a class="text-secondary" href = "/login/photo">Upload Profile Image</a>
    {:else}
    <form class="w-2/5" on:submit|preventDefault={confirmUsername}>
      <input
        type="text"
        placeholder="Username"
        class="input w-full"
        bind:value={username}
        on:input={checkAvailability}
        class:input-error={(!isValid && isTouched)}
        class:input-warning={isTaken}
        class:input-success={isAvailable && isValid && !loading}
      />
      <div class="my-4 min-h-16 px-8 w-full">
        {#if loading}
          <p class="text-secondary">Checking availability of @{username}...</p>
        {/if}
    
        {#if !isValid && isTouched}
          <p class="text-error text-sm">
            must be 3-16 characters long, alphanumeric only
          </p>
        {/if}
    
        {#if isValid && !isAvailable && !loading}
          <p class="text-warning text-sm">
            @{username} is not available
          </p>
        {/if}
    
        {#if isAvailable}
          <button class="btn btn-success">Confirm username @{username} </button>
        {/if}
      </div>
    </form>
    {/if}
  </AuthCheck>
  


